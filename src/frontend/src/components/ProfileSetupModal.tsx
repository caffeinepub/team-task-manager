import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSaveCallerUserProfile } from '../hooks/useSaveCallerUserProfile';
import { RoleType } from '../backend';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'founder' | 'employee'>('employee');
  const [roleType, setRoleType] = useState<RoleType>(RoleType.teacher);
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      saveProfile({ 
        name: name.trim(), 
        role,
        roleType: role === 'employee' ? roleType : RoleType.teacher
      });
    }
  };

  const isFormValid = name.trim() && (role === 'founder' || (role === 'employee' && roleType));

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome! Set up your profile</DialogTitle>
          <DialogDescription>Please provide your name and select your role to get started.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              autoFocus
            />
          </div>
          <div className="space-y-3">
            <Label>Your Role</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as 'founder' | 'employee')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="founder" id="founder" />
                <Label htmlFor="founder" className="font-normal cursor-pointer">
                  Founder / Admin
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employee" id="employee" />
                <Label htmlFor="employee" className="font-normal cursor-pointer">
                  Employee
                </Label>
              </div>
            </RadioGroup>
          </div>
          {role === 'employee' && (
            <div className="space-y-2">
              <Label htmlFor="roleType">Employee Type</Label>
              <Select value={roleType} onValueChange={(value) => setRoleType(value as RoleType)}>
                <SelectTrigger id="roleType">
                  <SelectValue placeholder="Select employee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RoleType.teacher}>Teacher</SelectItem>
                  <SelectItem value={RoleType.admin}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isPending || !isFormValid}>
            {isPending ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
