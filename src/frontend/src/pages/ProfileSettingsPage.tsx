import { useState, useEffect } from 'react';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { useSaveCallerUserProfile } from '../hooks/useSaveCallerUserProfile';
import { useGetCallerUserRole } from '../hooks/useGetCallerUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleType, UserRole } from '../backend';
import { User, Briefcase, GraduationCap, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSettingsPage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: userRole } = useGetCallerUserRole();
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [roleType, setRoleType] = useState<RoleType>(RoleType.teacher);

  const isAdmin = userRole === UserRole.admin;
  const isEmployee = userProfile?.role === 'employee';

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setRoleType(userProfile.roleType);
    }
  }, [userProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userProfile && name.trim()) {
      saveProfile(
        {
          name: name.trim(),
          role: userProfile.role,
          roleType: roleType,
        },
        {
          onSuccess: () => {
            toast.success('Profile updated successfully');
          },
          onError: (error: any) => {
            toast.error(error.message || 'Failed to update profile');
          },
        }
      );
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">No profile found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm py-1.5 px-3">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                  {userProfile.role === 'founder' ? 'Founder / Admin' : 'Employee'}
                </Badge>
                {isAdmin && (
                  <Badge className="text-sm py-1.5 px-3 bg-[oklch(0.65_0.19_85)] hover:bg-[oklch(0.60_0.19_85)]">
                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                    Admin Access
                  </Badge>
                )}
              </div>
            </div>

            {isEmployee && (
              <div className="space-y-2">
                <Label htmlFor="roleType">Employee Type</Label>
                <Select value={roleType} onValueChange={(value) => setRoleType(value as RoleType)}>
                  <SelectTrigger id="roleType">
                    <SelectValue placeholder="Select employee type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RoleType.teacher}>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Teacher
                      </div>
                    </SelectItem>
                    <SelectItem value={RoleType.admin}>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Your employee type helps organize team roles and responsibilities
                </p>
              </div>
            )}

            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
