import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Plus, Clock, Users, TrendingUp, AlertTriangle } from 'lucide-react';

// GraphQL Queries and Mutations
const GET_PRODUCTION_PLANS = gql`
  query GetProductionPlans {
    productionPlans {
      id
      productName
      quantity
      startDate
      endDate
      status
      progress
      assignedWorkers
      estimatedHours
      actualHours
      priority
    }
  }
`;

const CREATE_PRODUCTION_PLAN = gql`
  mutation CreateProductionPlan($input: ProductionPlanInput!) {
    createProductionPlan(input: $input) {
      id
      productName
      quantity
      startDate
      endDate
      status
      progress
      assignedWorkers
      estimatedHours
      actualHours
      priority
    }
  }
`;

const GET_RESOURCES = gql`
  query GetResources {
    resources {
      id
      name
      type
      capacity
      allocated
      available
      efficiency
    }
  }
`;

const CREATE_RESOURCE = gql`
  mutation CreateResource($input: ResourceInput!) {
    createResource(input: $input) {
      id
      name
      type
      capacity
      allocated
      available
      efficiency
    }
  }
`;

// Add GraphQL mutations
const UPDATE_PRODUCTION_PLAN = gql`
  mutation UpdateProductionPlan($id: ID!, $input: ProductionPlanInput!) {
    updateProductionPlan(id: $id, input: $input) {
      id
      productName
      quantity
      startDate
      endDate
      status
      progress
      assignedWorkers
      estimatedHours
      actualHours
      priority
    }
  }
`;
const DELETE_PRODUCTION_PLAN = gql`
  mutation DeleteProductionPlan($id: ID!) {
    deleteProductionPlan(id: $id) { id }
  }
`;
const UPDATE_RESOURCE = gql`
  mutation UpdateResource($id: ID!, $input: ResourceInput!) {
    updateResource(id: $id, input: $input) {
      id
      name
      type
      capacity
      allocated
      available
      efficiency
    }
  }
`;
const DELETE_RESOURCE = gql`
  mutation DeleteResource($id: ID!) {
    deleteResource(id: $id) { id }
  }
`;

interface ProductionPlan {
  id: string;
  productName: string;
  quantity: number;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  progress: number;
  assignedWorkers: number;
  estimatedHours: number;
  actualHours: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface Resource {
  id: string;
  name: string;
  type: 'MACHINE' | 'WORKER' | 'MATERIAL';
  capacity: number;
  allocated: number;
  available: number;
  efficiency: number;
}

const ProductionScheduler: React.FC = () => {
  const [isAddPlanDialogOpen, setAddPlanDialogOpen] = useState(false);
  const [isAddResourceDialogOpen, setAddResourceDialogOpen] = useState(false);

  // Add state for dialogs and selected items
  const [viewPlan, setViewPlan] = useState<ProductionPlan | null>(null);
  const [editPlan, setEditPlan] = useState<ProductionPlan | null>(null);
  const [deletePlan, setDeletePlan] = useState<ProductionPlan | null>(null);
  const [editResource, setEditResource] = useState<Resource | null>(null);
  const [deleteResource, setDeleteResource] = useState<Resource | null>(null);

  const { data: plansData, loading: plansLoading, error: plansError } = useQuery(GET_PRODUCTION_PLANS);
  const { data: resourcesData, loading: resourcesLoading, error: resourcesError } = useQuery(GET_RESOURCES);

  const [createProductionPlan, { error: createPlanError }] = useMutation(CREATE_PRODUCTION_PLAN, {
    refetchQueries: [{ query: GET_PRODUCTION_PLANS }],
    onError: (error) => {
      console.error("Error creating production plan:", error.message);
      // Here you could add a user-facing notification, e.g., using a toast library
    },
  });

  const [createResource] = useMutation(CREATE_RESOURCE, {
    refetchQueries: [{ query: GET_RESOURCES }],
  });

  // Add mutation hooks
  const [updateProductionPlan] = useMutation(UPDATE_PRODUCTION_PLAN, { refetchQueries: [{ query: GET_PRODUCTION_PLANS }] });
  const [deleteProductionPlan] = useMutation(DELETE_PRODUCTION_PLAN, { refetchQueries: [{ query: GET_PRODUCTION_PLANS }] });
  const [updateResource] = useMutation(UPDATE_RESOURCE, { refetchQueries: [{ query: GET_RESOURCES }] });
  const [deleteResourceMutation] = useMutation(DELETE_RESOURCE, { refetchQueries: [{ query: GET_RESOURCES }] });

  const productionPlans: ProductionPlan[] = plansData?.productionPlans || [];
  const resources: Resource[] = resourcesData?.resources || [];

  const [newPlan, setNewPlan] = useState({
    productName: '',
    quantity: 0,
    startDate: '',
    endDate: '',
    status: 'PLANNED' as ProductionPlan['status'],
    priority: 'MEDIUM' as ProductionPlan['priority'],
    assignedWorkers: 0,
    estimatedHours: 0,
  });

  const [newResource, setNewResource] = useState({
    name: '',
    type: 'MACHINE' as Resource['type'],
    capacity: 0,
    efficiency: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setState: Function) => {
    const { name, value } = e.target;
    setState((prevState: any) => ({ ...prevState, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string, setState: Function) => {
    setState((prevState: any) => ({ ...prevState, [name]: value }));
  };

  const isPlanFormValid = () => {
    const quantity = parseInt(String(newPlan.quantity), 10);
    const assignedWorkers = parseInt(String(newPlan.assignedWorkers), 10);
    const estimatedHours = parseInt(String(newPlan.estimatedHours), 10);
    return (
      newPlan.productName.trim() !== '' &&
      quantity > 0 &&
      assignedWorkers > 0 &&
      estimatedHours > 0
    );
  };

  const handleAddPlan = async () => {
    if (!isPlanFormValid()) {
      // Optionally, show a toast or alert to the user
      console.error("Form is invalid");
      return;
    }
    try {
      await createProductionPlan({
        variables: {
          input: {
            ...newPlan,
            quantity: parseInt(String(newPlan.quantity), 10) || 0,
            assignedWorkers: parseInt(String(newPlan.assignedWorkers), 10) || 0,
            estimatedHours: parseInt(String(newPlan.estimatedHours), 10) || 0,
          },
        },
      });
      setAddPlanDialogOpen(false);
    } catch (e) {
      // This will catch errors if the mutation hook itself throws an error, though onError is preferred for GraphQL errors.
      console.error("Failed to execute createProductionPlan mutation:", e);
    }
  };

  const handleAddResource = async () => {
    await createResource({
      variables: {
        input: {
          ...newResource,
          capacity: parseInt(String(newResource.capacity), 10),
          efficiency: parseInt(String(newResource.efficiency), 10),
        },
      },
    });
    setAddResourceDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'DELAYED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'MACHINE': return '⚙️';
      case 'WORKER': return '👷';
      case 'MATERIAL': return '📦';
      default: return '📋';
    }
  };

  const calculateOverallProgress = () => {
    if (productionPlans.length === 0) return 0;
    const totalProgress = productionPlans.reduce((sum, plan) => sum + plan.progress, 0);
    return Math.round(totalProgress / productionPlans.length);
  };

  const getActiveProjects = () => {
    return productionPlans.filter(plan => plan.status === 'IN_PROGRESS').length;
  };

  const getDelayedProjects = () => {
    return productionPlans.filter(plan => plan.status === 'DELAYED').length;
  };

  if (plansLoading || resourcesLoading) return <p>Loading...</p>;
  if (plansError) return <p>Error: {plansError.message}</p>;
  if (resourcesError) return <p>Error: {resourcesError.message}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-6 w-6 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Production Scheduler</h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold">{calculateOverallProgress()}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold">{getActiveProjects()}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Workers</p>
                <p className="text-2xl font-bold">{resources.find(r => r.name === 'Sewing Operators')?.capacity || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delayed Projects</p>
                <p className="text-2xl font-bold text-red-600">{getDelayedProjects()}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card> */}
      </div>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule">Production Schedule</TabsTrigger>
          <TabsTrigger value="resources">Resource Management</TabsTrigger>
          <TabsTrigger value="capacity">Capacity Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid grid-cols-4 md:grid-cols-12 gap-9 items-center w-full">
            <h1 className="text-3xl font-bold col-span-2 md:col-span-8">Production Plans</h1>
              <Dialog open={isAddPlanDialogOpen} onOpenChange={setAddPlanDialogOpen}>
                <DialogTrigger asChild>
                <div className="col-span-4 md:col-span-2 justify-self-end">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Production Plan
                  </Button>
                </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Production Plan</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="productName" className="text-right">Product Name</Label>
                      <Input id="productName" name="productName" value={newPlan.productName} onChange={(e) => handleInputChange(e, setNewPlan)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">Quantity</Label>
                      <Input id="quantity" name="quantity" type="number" value={newPlan.quantity} onChange={(e) => handleInputChange(e, setNewPlan)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="startDate" className="text-right">Start Date</Label>
                      <Input id="startDate" name="startDate" type="date" value={newPlan.startDate} onChange={(e) => handleInputChange(e, setNewPlan)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="endDate" className="text-right">End Date</Label>
                      <Input id="endDate" name="endDate" type="date" value={newPlan.endDate} onChange={(e) => handleInputChange(e, setNewPlan)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="assignedWorkers" className="text-right">Assigned Workers</Label>
                      <Input id="assignedWorkers" name="assignedWorkers" type="number" value={newPlan.assignedWorkers} onChange={(e) => handleInputChange(e, setNewPlan)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="estimatedHours" className="text-right">Estimated Hours</Label>
                      <Input id="estimatedHours" name="estimatedHours" type="number" value={newPlan.estimatedHours} onChange={(e) => handleInputChange(e, setNewPlan)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="priority" className="text-right">Priority</Label>
                      <Select onValueChange={(value) => handleSelectChange('priority', value, setNewPlan)} defaultValue={newPlan.priority}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">Status</Label>
                      <Select onValueChange={(value) => handleSelectChange('status', value, setNewPlan)} defaultValue={newPlan.status}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLANNED">Planned</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="DELAYED">Delayed</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleAddPlan} disabled={!isPlanFormValid()}>
                      Add Plan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productionPlans.map((plan) => (
                  <Card key={plan.id} className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(plan.priority)}`}></div>
                          <h3 className="font-semibold text-lg">{plan.productName}</h3>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Plan ID: {plan.id}
                        </div>
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>

                      <div>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Quantity:</span> {plan.quantity} units
                          </div>
                          <div>
                            <span className="font-medium">Workers:</span> {plan.assignedWorkers}
                          </div>
                          <div>
                            <span className="font-medium">Priority:</span> 
                            <span className={`ml-1 ${plan.priority === 'HIGH' ? 'text-red-600' : plan.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>
                              {plan.priority.charAt(0).toUpperCase() + plan.priority.slice(1).toLowerCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Start:</span> {(() => {
                              try {
                                return plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'N/A';
                              } catch (error) {
                                return 'Invalid Date';
                              }
                            })()}
                          </div>
                          <div>
                            <span className="font-medium">End:</span> {(() => {
                              try {
                                return plan.endDate ? new Date(plan.endDate).toLocaleDateString() : 'N/A';
                              } catch (error) {
                                return 'Invalid Date';
                              }
                            })()}
                          </div>
                          <div>
                            <span className="font-medium">Hours:</span> {plan.actualHours}/{plan.estimatedHours}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Progress</span>
                            <span className="text-sm">{plan.progress}%</span>
                          </div>
                          <Progress value={plan.progress} className="w-full" />
                          <div className="flex gap-2 flex-wrap">
                            <Button variant="outline" size="sm" onClick={() => setViewPlan(plan)}>View Details</Button>
                            <Button variant="outline" size="sm" onClick={() => {
                              // Format dates properly for the edit form with error handling
                              const formatDate = (dateString: string) => {
                                try {
                                  const date = new Date(dateString);
                                  if (isNaN(date.getTime())) {
                                    return '';
                                  }
                                  return date.toISOString().split('T')[0];
                                } catch (error) {
                                  console.warn('Invalid date format:', dateString);
                                  return '';
                                }
                              };
                              
                              const formattedPlan = {
                                ...plan,
                                startDate: plan.startDate ? formatDate(plan.startDate) : '',
                                endDate: plan.endDate ? formatDate(plan.endDate) : ''
                              };
                              setEditPlan(formattedPlan);
                            }}>Update</Button>
                            <Button variant="destructive" size="sm" onClick={() => setDeletePlan(plan)}>Delete</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid grid-cols-4 md:grid-cols-12 gap-9 items-center w-full">
            <h1 className="text-3xl font-bold col-span-2 md:col-span-8">Resource Allocation</h1>
                <Dialog open={isAddResourceDialogOpen} onOpenChange={setAddResourceDialogOpen}>
                  <DialogTrigger asChild>
                  <div className="col-span-4 md:col-span-2 justify-self-end">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Resource
                    </Button>
                  </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Resource</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" value={newResource.name} onChange={(e) => handleInputChange(e, setNewResource)} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="capacity" className="text-right">Capacity</Label>
                        <Input id="capacity" name="capacity" type="number" value={newResource.capacity} onChange={(e) => handleInputChange(e, setNewResource)} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="efficiency" className="text-right">Efficiency (%)</Label>
                        <Input id="efficiency" name="efficiency" type="number" value={newResource.efficiency} onChange={(e) => handleInputChange(e, setNewResource)} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Select onValueChange={(value) => handleSelectChange('type', value, setNewResource)} defaultValue={newResource.type}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MACHINE">Machine</SelectItem>
                            <SelectItem value="WORKER">Worker</SelectItem>
                            <SelectItem value="MATERIAL">Material</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleAddResource}>Add Resource</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                </div>
                </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.map((resource) => (
                  <Card key={resource.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getResourceTypeIcon(resource.type)}</span>
                        <div>
                          <h3 className="font-semibold">{resource.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{resource.type}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Utilization</span>
                            <span>{Math.round((resource.allocated / resource.capacity) * 100)}%</span>
                          </div>
                          <Progress value={(resource.allocated / resource.capacity) * 100} />
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="font-medium">Capacity</div>
                            <div>{resource.capacity}</div>
                          </div>
                          <div>
                            <div className="font-medium">Allocated</div>
                            <div>{resource.allocated}</div>
                          </div>
                          <div>
                            <div className="font-medium">Available</div>
                            <div className="text-green-600">{resource.available}</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Efficiency:</span>
                          <Badge variant={resource.efficiency >= 90 ? "default" : "secondary"}>
                            {resource.efficiency}%
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => setEditResource(resource)}>Update</Button>
                        <Button size="sm" variant="destructive" onClick={() => setDeleteResource(resource)}>Delete</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
              <div className="grid grid-cols-8 md:grid-cols-14 gap-10 items-center w-full">
              <h1 className="text-3xl font-bold col-span-2 md:col-span-8">Production Plans</h1>
              </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Overall Capacity Utilization</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <Progress value={78} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Peak Production Hours</span>
                      <span>8 AM - 5 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Daily Output</span>
                      <span>425 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bottleneck Resource</span>
                      <span className="text-red-600">Cutting Machines</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
              <div className="grid grid-cols-4 md:grid-cols-12 gap-9 items-center w-full">
              <h1 className="text-3xl font-bold col-span-2 md:col-span-8">Capacity Recommendations</h1>
              </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="font-medium text-yellow-800">High Utilization Alert</div>
                    <div className="text-sm text-yellow-700">
                      Cutting machines at 70% capacity. Consider adding shifts.
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800">Optimization Opportunity</div>
                    <div className="text-sm text-blue-700">
                      Quality inspectors have 25% available capacity for additional work.
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-800">Efficiency Gain</div>
                    <div className="text-sm text-green-700">
                      Sewing operators efficiency improved by 5% this month.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add dialogs for view, edit, and delete for plans and resources */}
      <Dialog open={!!viewPlan} onOpenChange={() => setViewPlan(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Production Plan Details</DialogTitle></DialogHeader>
          {viewPlan && (
            <div className="space-y-2">
              <div><b>Product Name:</b> {viewPlan.productName}</div>
              <div><b>Quantity:</b> {viewPlan.quantity}</div>
              <div><b>Start Date:</b> {(() => {
                try {
                  return viewPlan.startDate ? new Date(viewPlan.startDate).toLocaleDateString() : 'N/A';
                } catch (error) {
                  return 'Invalid Date';
                }
              })()}</div>
              <div><b>End Date:</b> {(() => {
                try {
                  return viewPlan.endDate ? new Date(viewPlan.endDate).toLocaleDateString() : 'N/A';
                } catch (error) {
                  return 'Invalid Date';
                }
              })()}</div>
              <div><b>Status:</b> {viewPlan.status}</div>
              <div><b>Priority:</b> {viewPlan.priority}</div>
              <div><b>Assigned Workers:</b> {viewPlan.assignedWorkers}</div>
              <div><b>Estimated Hours:</b> {viewPlan.estimatedHours}</div>
              <div><b>Actual Hours:</b> {viewPlan.actualHours}</div>
              <div><b>Progress:</b> {viewPlan.progress}%</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!editPlan} onOpenChange={() => setEditPlan(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Production Plan</DialogTitle></DialogHeader>
          {editPlan && (
            <form onSubmit={async e => {
              e.preventDefault();
              if (!editPlan) return;
              
              // Validate dates before submission
              const startDate = editPlan.startDate ? new Date(editPlan.startDate) : null;
              const endDate = editPlan.endDate ? new Date(editPlan.endDate) : null;
              
              if (startDate && isNaN(startDate.getTime())) {
                alert('Please enter a valid start date');
                return;
              }
              if (endDate && isNaN(endDate.getTime())) {
                alert('Please enter a valid end date');
                return;
              }
              
              const { id, __typename, progress, actualHours, ...input } = editPlan as any;
              
              // Only include dates if they are valid
              if (startDate) input.startDate = startDate.toISOString();
              if (endDate) input.endDate = endDate.toISOString();
              
              await updateProductionPlan({ variables: { id, input } });
              setEditPlan(null);
            }} className="space-y-2">
              <Input value={editPlan.productName} onChange={e => setEditPlan({ ...editPlan, productName: e.target.value })} placeholder="Product Name" />
              <Input type="number" value={editPlan.quantity} onChange={e => setEditPlan({ ...editPlan, quantity: Number(e.target.value) })} placeholder="Quantity" />
              <Input 
                type="date" 
                value={editPlan.startDate || ''} 
                onChange={e => setEditPlan({ ...editPlan, startDate: e.target.value })} 
                placeholder="Start Date" 
              />
              <Input 
                type="date" 
                value={editPlan.endDate || ''} 
                onChange={e => setEditPlan({ ...editPlan, endDate: e.target.value })} 
                placeholder="End Date" 
              />
              <Input type="number" value={editPlan.assignedWorkers} onChange={e => setEditPlan({ ...editPlan, assignedWorkers: Number(e.target.value) })} placeholder="Assigned Workers" />
              <Input type="number" value={editPlan.estimatedHours} onChange={e => setEditPlan({ ...editPlan, estimatedHours: Number(e.target.value) })} placeholder="Estimated Hours" />
              <Input type="number" value={editPlan.actualHours} onChange={e => setEditPlan({ ...editPlan, actualHours: Number(e.target.value) })} placeholder="Actual Hours" />
              <Select value={editPlan.status} onValueChange={v => setEditPlan({ ...editPlan, status: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNED">Planned</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DELAYED">Delayed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={editPlan.priority} onValueChange={v => setEditPlan({ ...editPlan, priority: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!deletePlan} onOpenChange={() => setDeletePlan(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Production Plan</DialogTitle></DialogHeader>
          <div>Are you sure you want to delete this plan?</div>
          <DialogFooter>
            <Button variant="destructive" onClick={async () => {
              if (!deletePlan) return;
              await deleteProductionPlan({ variables: { id: deletePlan.id } });
              setDeletePlan(null);
            }}>Delete</Button>
            <Button variant="outline" onClick={() => setDeletePlan(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editResource} onOpenChange={() => setEditResource(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Resource</DialogTitle></DialogHeader>
          {editResource && (
            <form onSubmit={async e => {
              e.preventDefault();
              if (!editResource) return;
              // Only send fields allowed by ResourceInput
              const { id, __typename, ...input } = editResource as any;
              await updateResource({ variables: { id, input } });
              setEditResource(null);
            }} className="space-y-2">
              <Input value={editResource.name} onChange={e => setEditResource({ ...editResource, name: e.target.value })} placeholder="Name" />
              <Input type="number" value={editResource.capacity} onChange={e => setEditResource({ ...editResource, capacity: Number(e.target.value) })} placeholder="Capacity" />
              <Input type="number" value={editResource.allocated} onChange={e => setEditResource({ ...editResource, allocated: Number(e.target.value) })} placeholder="Allocated" />
              <Input type="number" value={editResource.available} onChange={e => setEditResource({ ...editResource, available: Number(e.target.value) })} placeholder="Available" />
              <Input type="number" value={editResource.efficiency} onChange={e => setEditResource({ ...editResource, efficiency: Number(e.target.value) })} placeholder="Efficiency" />
              <Select value={editResource.type} onValueChange={v => setEditResource({ ...editResource, type: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MACHINE">Machine</SelectItem>
                  <SelectItem value="WORKER">Worker</SelectItem>
                  <SelectItem value="MATERIAL">Material</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteResource} onOpenChange={() => setDeleteResource(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Resource</DialogTitle></DialogHeader>
          <div>Are you sure you want to delete this resource?</div>
          <DialogFooter>
            <Button variant="destructive" onClick={async () => {
              if (!deleteResource) return;
              await deleteResourceMutation({ variables: { id: deleteResource.id } });
              setDeleteResource(null);
            }}>Delete</Button>
            <Button variant="outline" onClick={() => setDeleteResource(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductionScheduler;
