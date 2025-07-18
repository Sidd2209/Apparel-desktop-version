import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserInput!) {
    updateUserProfile(input: $input) {
      id
      name
      department
      preferredHomepage
    }
  }
`;

// Use uppercase department values to match backend
const DEPARTMENTS = [
  { value: 'DESIGN', label: 'Merchandising' },
  { value: 'SOURCING', label: 'Logistics' },
  { value: 'PRODUCTION', label: 'Procurement' },
  { value: 'SALES', label: 'Sampling' },
  { value: 'INVENTORY', label: 'Management' },
];

export function ProfileSetup() {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();

  const [runProfileMutation, { loading, error }] = useMutation(UPDATE_USER_PROFILE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !department || !user) return;

    try {
      const { data } = await runProfileMutation({
        variables: {
          input: {
            googleId: user.id,
            email: user.email,
            name,
            department,
          },
        },
      });

      if (data.updateUserProfile) {
        updateUserProfile(data.updateUserProfile);
        navigate('/dashboard'); // Explicitly navigate to the dashboard
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      // Handle error display to the user
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
              <Select onValueChange={setDepartment} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
            {error && <div className="text-red-500 text-sm">{error.message}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
