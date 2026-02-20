import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type OldTask = {
    id : Text;
    title : Text;
    description : Text;
    assignedEmployee : Principal;
    dueDate : Time.Time;
    progress : Nat;
    projectId : Text;
    status : { #pending; #inProgress; #completed };
    reminderDate : Time.Time;
    priority : { #low; #medium; #high; #critical };
    timeEntries : [{
      startTime : Time.Time;
      endTime : ?Time.Time;
      duration : ?Nat;
      user : Principal;
    }];
    comments : [{
      author : Principal;
      content : Text;
      timestamp : Time.Time;
    }];
    attachments : [Storage.ExternalBlob];
    dependencies : [Text];
    recurring : ?{
      frequency : {
        #daily : Nat;
        #weekly : Nat;
        #monthly : Nat;
      };
      nextOccurrence : Time.Time;
    };
    customFields : [{ name : Text; value : Text }];
  };

  type OldActor = {
    tasks : Map.Map<Text, OldTask>;
    // ... other unchanged fields ...
  };

  type NewTask = {
    id : Text;
    title : Text;
    description : Text;
    assignedEmployee : Principal;
    dueDate : Time.Time;
    progress : Nat;
    projectId : Text;
    status : { #pending; #inProgress; #completed };
    reminderDate : Time.Time;
    priority : { #low; #medium; #high; #critical };
    timeEntries : [{
      startTime : Time.Time;
      endTime : ?Time.Time;
      duration : ?Nat;
      user : Principal;
    }];
    comments : [{
      author : Principal;
      content : Text;
      timestamp : Time.Time;
    }];
    attachments : [Storage.ExternalBlob];
    dependencies : [Text];
    recurring : ?{
      frequency : {
        #daily : Nat;
        #weekly : Nat;
        #monthly : Nat;
      };
      nextOccurrence : Time.Time;
    };
    customFields : [{ name : Text; value : Text }];
    submissionTimestamp : ?Time.Time;
  };

  type NewActor = {
    tasks : Map.Map<Text, NewTask>;
    // ... other unchanged fields ...
  };

  public func run(old : OldActor) : NewActor {
    let newTasks = old.tasks.map<Text, OldTask, NewTask>(
      func(_id, oldTask) {
        { oldTask with submissionTimestamp = null };
      }
    );
    { old with tasks = newTasks };
  };
};

