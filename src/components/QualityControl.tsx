
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface QualityCheck {
  id: string;
  productId: string;
  productName: string;
  stage: 'cutting' | 'sewing' | 'finishing' | 'packaging';
  checklistItems: ChecklistItem[];
  inspector: string;
  date: string;
  status: 'passed' | 'failed' | 'pending';
  issues: QualityIssue[];
}

interface ChecklistItem {
  id: string;
  description: string;
  checked: boolean;
  critical: boolean;
}

interface QualityIssue {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved';
  assignedTo: string;
  createdAt: string;
}

const QualityControl: React.FC = () => {
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([
    {
      id: 'QC-001',
      productId: 'PRD-001',
      productName: 'Summer Breeze T-Shirt',
      stage: 'sewing',
      inspector: 'Maria Rodriguez',
      date: '2024-01-15',
      status: 'passed',
      checklistItems: [
        { id: 'C1', description: 'Seam quality check', checked: true, critical: true },
        { id: 'C2', description: 'Thread tension verification', checked: true, critical: false },
        { id: 'C3', description: 'Size measurements', checked: true, critical: true },
      ],
      issues: []
    },
    {
      id: 'QC-002',
      productId: 'PRD-002',
      productName: 'Urban Denim Jacket',
      stage: 'finishing',
      inspector: 'James Kim',
      date: '2024-01-14',
      status: 'failed',
      checklistItems: [
        { id: 'C4', description: 'Button attachment', checked: false, critical: true },
        { id: 'C5', description: 'Zipper functionality', checked: true, critical: true },
        { id: 'C6', description: 'Final pressing', checked: true, critical: false },
      ],
      issues: [
        {
          id: 'ISS-001',
          description: 'Button not securely attached on 3 units',
          severity: 'high',
          status: 'open',
          assignedTo: 'Production Team A',
          createdAt: '2024-01-14'
        }
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    const colors = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-6 w-6 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900">Quality Control Management</h1>
      </div>

      <Tabs defaultValue="inspections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inspections">Quality Inspections</TabsTrigger>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
          <TabsTrigger value="issues">Issues Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="inspections" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {qualityChecks.filter(qc => qc.status === 'passed').length}
              </div>
              <div className="text-sm text-gray-600">Passed Inspections</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {qualityChecks.filter(qc => qc.status === 'failed').length}
              </div>
              <div className="text-sm text-gray-600">Failed Inspections</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {qualityChecks.filter(qc => qc.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending Reviews</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {((qualityChecks.filter(qc => qc.status === 'passed').length / qualityChecks.length) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Pass Rate</div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Quality Inspections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityChecks.map((check) => (
                  <Card key={check.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="font-semibold">{check.productName}</div>
                        <div className="text-sm text-gray-600">Stage: {check.stage}</div>
                        <Badge className={getStatusColor(check.status)}>
                          {check.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium">Checklist Progress</div>
                        <div className="text-sm">
                          {check.checklistItems.filter(item => item.checked).length} / {check.checklistItems.length} items
                        </div>
                        <div className="flex gap-1 mt-1">
                          {check.checklistItems.map((item) => (
                            <div key={item.id} className="flex items-center">
                              {item.checked ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className={`h-4 w-4 ${item.critical ? 'text-red-600' : 'text-gray-400'}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">Inspector</div>
                        <div className="text-sm">{check.inspector}</div>
                        <div className="text-sm text-gray-600">Date: {check.date}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">Issues</div>
                        <div className="text-sm">
                          {check.issues.length} {check.issues.length === 1 ? 'issue' : 'issues'}
                        </div>
                        {check.issues.length > 0 && (
                          <AlertTriangle className="h-4 w-4 text-orange-600 mt-1" />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklists" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Checklists by Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Cutting Stage</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Fabric grain alignment</li>
                    <li>• Pattern matching accuracy</li>
                    <li>• Cutting precision</li>
                    <li>• Defect identification</li>
                  </ul>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Sewing Stage</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Seam quality and strength</li>
                    <li>• Thread tension consistency</li>
                    <li>• Stitch per inch verification</li>
                    <li>• Pattern alignment</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Finishing Stage</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Button and zipper functionality</li>
                    <li>• Label placement accuracy</li>
                    <li>• Final pressing quality</li>
                    <li>• Overall appearance</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Packaging Stage</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Size label verification</li>
                    <li>• Care label attachment</li>
                    <li>• Packaging integrity</li>
                    <li>• Final count verification</li>
                  </ul>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Issues Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityChecks.flatMap(check => check.issues).map((issue) => (
                  <Card key={issue.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="font-semibold">{issue.description}</div>
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium">Assigned To</div>
                        <div className="text-sm">{issue.assignedTo}</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">Status</div>
                        <Badge className={issue.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                          {issue.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div>
                        <div className="text-sm font-medium">Created</div>
                        <div className="text-sm">{issue.createdAt}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualityControl;
