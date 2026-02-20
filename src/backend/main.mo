import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = {
    name : Text;
    role : Text;
    roleType : RoleType;
  };

  public type RoleType = {
    #teacher;
    #admin;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let existingProfile = userProfiles.get(caller);
    switch (existingProfile) {
      case (?existing) {
        let roleTypeChanged = switch (existing.roleType, profile.roleType) {
          case (#teacher, #admin) { true };
          case (#admin, #teacher) { true };
          case _ { false };
        };

        if (roleTypeChanged and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only admins can change roleType");
        };
      };
      case (null) {
        if (profile.roleType == #admin and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only admins can set roleType to admin");
        };
      };
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func setUserRoleType(user : Principal, roleType : RoleType) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set user roleType");
    };

    let existingProfile = switch (userProfiles.get(user)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User profile does not exist") };
    };

    let updatedProfile = {
      existingProfile with
      roleType = roleType;
    };

    userProfiles.add(user, updatedProfile);
  };

  public type Project = {
    id : Text;
    name : Text;
    description : Text;
    creator : Principal;
  };

  module Project {
    public func compare(p1 : Project, p2 : Project) : Order.Order {
      Text.compare(p1.id, p2.id);
    };
  };

  let projects = Map.empty<Text, Project>();

  public type Task = {
    id : Text;
    title : Text;
    description : Text;
    assignedEmployee : Principal;
    dueDate : Time.Time;
    progress : Nat;
    projectId : Text;
    status : TaskStatus;
    reminderDate : Time.Time;
    priority : TaskPriority;
    timeEntries : [TimeEntry];
    comments : [Comment];
    attachments : [Storage.ExternalBlob];
    dependencies : [Text];
    recurring : ?RecurringTask;
    customFields : [CustomField];
    submissionTimestamp : ?Time.Time;
  };

  module Task {
    public func compare(t1 : Task, t2 : Task) : Order.Order {
      Text.compare(t1.id, t2.id);
    };
  };

  public type TaskStatus = {
    #pending;
    #inProgress;
    #completed;
  };

  public type TaskPriority = {
    #low;
    #medium;
    #high;
    #critical;
  };

  public type TimeEntry = {
    startTime : Time.Time;
    endTime : ?Time.Time;
    duration : ?Nat;
    user : Principal;
  };

  public type Comment = {
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type RecurringTask = {
    frequency : RecurrenceFrequency;
    nextOccurrence : Time.Time;
  };

  public type RecurrenceFrequency = {
    #daily : Nat;
    #weekly : Nat;
    #monthly : Nat;
  };

  public type CustomField = {
    name : Text;
    value : Text;
  };

  public type TaskTemplate = {
    id : Text;
    title : Text;
    description : Text;
    priority : TaskPriority;
    customFields : [CustomField];
  };

  public type Report = {
    completionRate : Nat;
    averageTaskDuration : Nat;
    onTimeDeliveryPercentage : Nat;
    productivityTrends : [ProductivityTrend];
  };

  public type ProductivityTrend = {
    period : Text;
    tasksCompleted : Nat;
    averageCompletionTime : Nat;
  };

  let tasks = Map.empty<Text, Task>();
  let templates = Map.empty<Text, TaskTemplate>();

  public shared ({ caller }) func createProject(id : Text, name : Text, description : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create projects");
    };

    let project : Project = {
      id;
      name;
      description;
      creator = caller;
    };

    projects.add(id, project);
  };

  public shared ({ caller }) func createTask(
    id : Text,
    title : Text,
    description : Text,
    assignedEmployee : Principal,
    dueDate : Time.Time,
    projectId : Text,
    reminderDate : Time.Time,
    priority : TaskPriority,
    dependencies : [Text],
    recurring : ?RecurringTask,
    customFields : [CustomField],
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create tasks");
    };

    let task : Task = {
      id;
      title;
      description;
      assignedEmployee;
      dueDate;
      progress = 0;
      projectId;
      status = #pending;
      reminderDate;
      priority;
      timeEntries = [];
      comments = [];
      attachments = [];
      dependencies;
      recurring;
      customFields;
      submissionTimestamp = null;
    };

    tasks.add(id, task);
  };

  public shared ({ caller }) func startTaskTimer(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can track time");
    };

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task does not exist") };
      case (?task) { task };
    };

    if (not (Principal.equal(task.assignedEmployee, caller)) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only assigned employee or admins can start timer");
    };

    let newEntry : TimeEntry = {
      startTime = Time.now();
      endTime = null;
      duration = null;
      user = caller;
    };

    let updatedTask = {
      task with
      timeEntries = task.timeEntries.concat([newEntry]);
    };

    tasks.add(taskId, updatedTask);
  };

  public shared ({ caller }) func stopTaskTimer(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can track time");
    };

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task does not exist") };
      case (?task) { task };
    };

    if (not (Principal.equal(task.assignedEmployee, caller)) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only assigned employee or admins can stop timer");
    };

    let updatedTimeEntries : [TimeEntry] = task.timeEntries.map<TimeEntry, TimeEntry>(
      func(entry) {
        if (entry.user == caller and entry.endTime == null) {
          let endTime = Time.now();
          let duration = switch (entry.duration) {
            case (null) {
              switch (entry.endTime) {
                case (null) {
                  switch (entry) {
                    case ({ startTime }) {
                      let _diff = endTime - startTime;
                      ?0;
                    };
                  };
                };
                case (_) { entry.duration };
              };
            };
            case (_) { entry.duration };
          };
          {
            entry with
            endTime = ?endTime;
            duration;
          };
        } else {
          entry;
        };
      }
    );

    tasks.add(taskId, { task with timeEntries = updatedTimeEntries });
  };

  public shared ({ caller }) func addTaskComment(taskId : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment on tasks");
    };

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task does not exist") };
      case (?task) { task };
    };

    if (not (Principal.equal(task.assignedEmployee, caller)) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only assigned employee or admins can comment on tasks");
    };

    let comment : Comment = {
      author = caller;
      content;
      timestamp = Time.now();
    };

    let updatedTask = {
      task with
      comments = task.comments.concat([comment]);
    };

    tasks.add(taskId, updatedTask);
  };

  public shared ({ caller }) func addTaskAttachment(taskId : Text, attachment : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can attach files");
    };

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task does not exist") };
      case (?task) { task };
    };

    if (not (Principal.equal(task.assignedEmployee, caller)) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only assigned employee or admins can attach files to tasks");
    };

    let updatedTask = {
      task with
      attachments = task.attachments.concat([attachment]);
    };

    tasks.add(taskId, updatedTask);
  };

  public shared ({ caller }) func createTaskTemplate(
    id : Text,
    title : Text,
    description : Text,
    priority : TaskPriority,
    customFields : [CustomField],
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create templates");
    };

    let template : TaskTemplate = {
      id;
      title;
      description;
      priority;
      customFields;
    };

    templates.add(id, template);
  };

  public query ({ caller }) func getAllTaskTemplates() : async [TaskTemplate] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view templates");
    };
    templates.values().toArray();
  };

  public query ({ caller }) func getProjectReport() : async Report {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view reports");
    };

    let totalTasks = tasks.size();
    let completedTasks = tasks.values().toArray().filter(
      func(task) { task.status == #completed }
    ).size();

    let completionRate = if (totalTasks == 0) { 0 } else {
      (completedTasks * 100) / totalTasks;
    };

    let allTimeEntries = tasks.values().toArray().flatMap(
      func(task) { task.timeEntries.values() }
    );

    let totalDuration = allTimeEntries.foldLeft(
      0,
      func(acc, entry) {
        switch (entry.duration) {
          case (null) { acc };
          case (?d) { acc + d };
        };
      },
    );

    let avgDuration = if (allTimeEntries.size() == 0) { 0 } else {
      totalDuration / allTimeEntries.size();
    };

    {
      completionRate;
      averageTaskDuration = avgDuration;
      onTimeDeliveryPercentage = 0;
      productivityTrends = [];
    };
  };

  public query ({ caller }) func getAssignedTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view assigned tasks");
    };

    tasks.values().toArray().filter(
      func(task) { Principal.equal(task.assignedEmployee, caller) }
    );
  };

  public shared ({ caller }) func updateTaskProgress(taskId : Text, progress : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update task progress");
    };

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task does not exist") };
      case (?task) { task };
    };

    if (not (Principal.equal(task.assignedEmployee, caller)) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only assigned employee or admins can update task progress");
    };

    let updatedTask = {
      task with
      progress;
      status = if (progress == 100) { #completed } else { #inProgress };
    };

    tasks.add(taskId, updatedTask);
  };

  public query ({ caller }) func getAllProjects() : async [Project] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view projects");
    };
    projects.values().toArray().sort();
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all tasks");
    };
    tasks.values().toArray().sort();
  };

  public shared ({ caller }) func submitWorkForTask(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit work for tasks");
    };

    let task = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task does not exist") };
      case (?task) { task };
    };

    if (not Principal.equal(task.assignedEmployee, caller)) {
      Runtime.trap("Unauthorized: You can only submit work for tasks assigned to you");
    };

    if (task.status == #completed) {
      Runtime.trap("Task is already marked as completed");
    };

    let updatedTask = {
      task with
      status = #completed;
      progress = 100;
      submissionTimestamp = ?Time.now();
    };

    tasks.add(taskId, updatedTask);
  };
};

