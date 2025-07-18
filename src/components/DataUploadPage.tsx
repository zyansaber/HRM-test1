import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Calendar, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { UploadTemplate } from '@/types/hr';

export const DataUploadPage = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const structureDataForFirebase = (rawData: any[], type: string, selectedDate: string) => {
    switch (type) {
      case 'LocationMap':
        const locationMap: any = {};
        rawData.forEach(row => {
          const dept = row.Department;
          if (dept && !locationMap[dept]) {
            locationMap[dept] = [];
          }
          // Add locations from row (Location1, Location2, etc.)
          Object.keys(row).forEach(key => {
            if (key.startsWith('Location') && row[key]) {
              if (!locationMap[dept].includes(row[key])) {
                locationMap[dept].push(row[key]);
              }
            }
          });
        });
        return locationMap;

      case 'Overtime':
        const overtimeData: any = {};
        rawData.forEach(row => {
          const dept = row.Department;
          const location = row.Location;
          const date = selectedDate;
          
          if (!overtimeData[dept]) overtimeData[dept] = {};
          if (!overtimeData[dept][location]) overtimeData[dept][location] = {};
          
          overtimeData[dept][location][date] = {
            OT_Amount: row.OT_Amount || '$0.00',
            OT_Hours: parseFloat(row.OT_Hours) || 0
          };
        });
        return overtimeData;

case 'Payment':
  const paymentData: any = {};
  rawData.forEach(row => {
    const dept = row.Department;
    const location = row.Location;
    const empId = row.EmployeeID;
    const date = selectedDate;

    if (!paymentData[dept]) paymentData[dept] = {};
    if (!paymentData[dept][location]) paymentData[dept][location] = {};
    if (!paymentData[dept][location][empId]) paymentData[dept][location][empId] = {};

    // 单独写 Name，只设置一次
    if (!paymentData[dept][location][empId]['Name']) {
      paymentData[dept][location][empId]['Name'] = row.Name || 'Unknown';
    }

    // 👇 正确追加日期内容，不覆盖已有数据
    paymentData[dept][location][empId][date] = {
      Payment: row.Payment || '$0.00'
    };
  });
  return paymentData;


      case 'Absenteeism':
        const absenteeismData: any = {};
        rawData.forEach(row => {
          const dept = row.Department;
          const location = row.Location;
          const empId = row.EmployeeID;
          const date = selectedDate;
          
          if (!absenteeismData[dept]) absenteeismData[dept] = {};
          if (!absenteeismData[dept][location]) absenteeismData[dept][location] = {};
          if (!absenteeismData[dept][location][empId]) {
            absenteeismData[dept][location][empId] = {
              Name: row.Name || 'Unknown'
            };
          }
          
          absenteeismData[dept][location][empId][date] = {
            Absenteeism: parseFloat(row.Absenteeism) || 0
          };
        });
        return absenteeismData;

      default:
        return rawData;
    }
  };

  const uploadTemplates: UploadTemplate[] = [
    {
      type: 'LocationMap',
      filename: 'LocationMap_Template.xlsx',
      description: 'Define departments and their corresponding locations'
    },
    {
      type: 'Overtime',
      filename: 'Overtime_Template.xlsx',
      description: 'Upload overtime hours and amounts by department and location'
    },
    {
      type: 'Payment',
      filename: 'Payment_Template.xlsx',
      description: 'Upload employee payment information by department and location'
    },
    {
      type: 'Absenteeism',
      filename: 'Absenteeism_Template.xlsx',
      description: 'Upload employee absenteeism data by department and location'
    },
    {
      type: 'startertermination',
      filename: 'StarterTermination_Template.xlsx',
      description: 'Upload new hires and terminations by department and position'
    }
  ];

  const handleDownloadTemplate = (template: UploadTemplate) => {
    const sampleData = generateSampleData(template.type);
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = template.filename.replace('.xlsx', '.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateSampleData = (type: string): string => {
    switch (type) {
      case 'LocationMap':
        return `Department,Location1,Location2,Location3
Dealerships,Geelong Sales,Launceston Sales,Melbourne Sales
Production,Factory Floor,Quality Control,Warehouse
Administration,Head Office,Regional Office,`;

      case 'Overtime':
        return `Department,Location,Date,OT_Hours,OT_Amount
Dealerships,Geelong Sales,2025-07-02,7.5,$1111.00
Dealerships,Geelong Sales,2025-07-09,8.0,$1234.56
Production,Factory Floor,2025-07-02,12.0,$1800.00`;

      case 'Payment':
        return `Department,Location,EmployeeID,Name,Date,Payment
Dealerships,Geelong Sales,11169436,Emma Thomson,2025-07-02,$1200.00
Dealerships,Geelong Sales,11169436,Emma Thomson,2025-07-09,$1250.00
Production,Factory Floor,12345678,John Smith,2025-07-02,$1500.00`;

      case 'Absenteeism':
        return `Department,Location,EmployeeID,Name,Date,Absenteeism
Dealerships,Geelong Sales,11169436,Emma Thomson,2025-07-02,0.2
Dealerships,Geelong Sales,11169436,Emma Thomson,2025-07-09,0.25
Production,Factory Floor,12345678,John Smith,2025-07-02,1.5`;

      case 'startertermination':
        return `Type,Date,Department,Position,EmployeeID,Name
starter,2025-07-02,Production,Production_team_member,12345,John Doe
termination,2025-07-09,Administration,Admin_assistant,54321,Jane Smith`;

      default:
        return 'No template available';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file);
    setUploadStatus('idle');
    setUploadMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDate || !selectedType) {
      setUploadStatus('error');
      setUploadMessage('Please select date, data type, and file before uploading.');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Processing and uploading file to Firebase...');

    try {
      const text = await selectedFile.text();
      let parsedData;

      // Parse CSV data and structure according to Firebase schema
      if (selectedFile.name.endsWith('.csv')) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const rawData = [];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            rawData.push(row);
          }
        }

        // Structure data according to Firebase schema
        parsedData = structureDataForFirebase(rawData, selectedType, selectedDate);
      } else {
        // For JSON files
        parsedData = JSON.parse(text);
      }

      // Upload to Firebase with correct structure
      const response = await fetch(`https://stocktaking-5b7a8-default-rtdb.firebaseio.com/${selectedType}.json`, {
       method: 'PATCH',
       headers: {
          'Content-Type': 'application/json',
       },
       body: JSON.stringify(parsedData),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      setUploadStatus('success');
      setUploadMessage(`Successfully uploaded ${selectedFile.name} to Firebase ${selectedType} database. Data is now available in the dashboard.`);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadMessage('Upload failed. Please check your file format and try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Data Upload Center
        </h1>
        <p className="text-lg text-muted-foreground">
          Upload HR data to Firebase database
        </p>
      </div>

      {/* Upload Form */}
      <Card className="shadow-xl border-t-4 border-t-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6 text-blue-600" />
            Upload HR Data
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Select Date
              </Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                This date will be used for all time-related fields in the uploaded data
              </p>
            </div>

            {/* Data Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="type" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Data Type
              </Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type to upload" />
                </SelectTrigger>
                <SelectContent>
                  {uploadTemplates.map((template) => (
                    <SelectItem key={template.type} value={template.type}>
                      {template.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label htmlFor="file" className="text-lg font-semibold">
              Upload File
            </Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls,.csv,.json"
              onChange={handleFileSelect}
              disabled={!selectedDate || !selectedType}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            
            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">
                  Selected file: {selectedFile.name}
                </span>
                <Button
                  onClick={handleUpload}
                  disabled={uploadStatus === 'uploading'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {uploadStatus === 'uploading' ? 'Uploading...' : 'Start Upload'}
                </Button>
              </div>
            )}
            
            {uploadStatus !== 'idle' && (
              <Alert className={uploadStatus === 'success' ? 'border-green-500' : uploadStatus === 'error' ? 'border-red-500' : 'border-blue-500'}>
                {uploadStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : uploadStatus === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <Upload className="h-4 w-4 text-blue-600" />
                )}
                <AlertDescription>{uploadMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Templates Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-6 w-6 text-green-600" />
            Download Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadTemplates.map((template) => (
              <Card key={template.type} className="border-l-4 border-l-green-400 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {template.type}
                    </Badge>
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{template.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadTemplate(template)}
                    className="w-full hover:bg-green-50 hover:text-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="shadow-lg border-l-4 border-l-orange-400">
        <CardHeader>
          <CardTitle className="text-orange-700">Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Step-by-Step Process:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Select the date you want to associate with the data</li>
              <li>Choose the type of data you're uploading</li>
              <li>Download the corresponding template if needed</li>
              <li>Fill in your data following the template format</li>
              <li>Select your completed file</li>
              <li>Click "Start Upload" to upload to Firebase</li>
            </ol>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-semibold text-amber-800 mb-2">Important Notes:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
              <li>Data will be structured according to Firebase schema automatically</li>
              <li>Supported file formats: .xlsx, .xls, .csv, .json</li>
              <li>Make sure column names match the template exactly</li>
              <li>The selected date will be used for all date fields</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
