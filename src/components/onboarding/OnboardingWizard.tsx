import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Upload, 
  FileText, 
  Sparkles, 
  Users,
  BarChart,
  Globe,
  Shield,
  Zap,
  Info
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  action?: () => void;
}

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to KnowWhere Bridge Insights',
      description: 'Your AI-powered business intelligence platform',
      icon: <Sparkles className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Welcome aboard!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Let's get you started with KnowWhere Bridge Insights. This quick tour will help you 
              understand how to leverage AI for your business analysis needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <Shield className="h-8 w-8 text-primary mb-2" />
                <h4 className="font-semibold">Secure & Private</h4>
                <p className="text-sm text-muted-foreground">Your data is encrypted and never shared</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <Zap className="h-8 w-8 text-primary mb-2" />
                <h4 className="font-semibold">AI-Powered</h4>
                <p className="text-sm text-muted-foreground">Advanced AI models for deep insights</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <Globe className="h-8 w-8 text-primary mb-2" />
                <h4 className="font-semibold">Global Reach</h4>
                <p className="text-sm text-muted-foreground">Multi-language support for international business</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'upload',
      title: 'Upload Your Business Documents',
      description: 'Start by uploading your business registration or company documents',
      icon: <Upload className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Upload your business registration certificate, company profile, or any business documents 
              you want to analyze. Supported formats: PDF, DOC, DOCX, TXT
            </AlertDescription>
          </Alert>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">How to upload documents</h4>
            <ol className="text-left max-w-md mx-auto space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="font-semibold">1.</span>
                <span>Navigate to the "Documents" section</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">2.</span>
                <span>Click "Upload Document" or drag & drop your files</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">3.</span>
                <span>Select document type and add optional notes</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">4.</span>
                <span>Click "Upload" to securely store your document</span>
              </li>
            </ol>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your documents are encrypted and stored securely</span>
          </div>
        </div>
      )
    },
    {
      id: 'analyze',
      title: 'Request AI Analysis',
      description: 'Let our AI analyze your documents for insights',
      icon: <Sparkles className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  GPT-4 Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Comprehensive business assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Market positioning analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Strategic recommendations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Perplexity Research
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Real-time market research</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Competitor analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Industry trends & insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              Click the "Request AI Analysis" button on any uploaded document to start the analysis process. 
              You can customize the analysis with specific questions or focus areas.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      id: 'results',
      title: 'View & Download Reports',
      description: 'Access your analysis results and download comprehensive reports',
      icon: <FileText className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h4 className="font-semibold mb-4">Your analysis reports include:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Badge className="mt-1">1</Badge>
                <div>
                  <p className="font-medium">Executive Summary</p>
                  <p className="text-sm text-muted-foreground">Key findings and recommendations</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="mt-1">2</Badge>
                <div>
                  <p className="font-medium">Market Analysis</p>
                  <p className="text-sm text-muted-foreground">Industry trends and positioning</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="mt-1">3</Badge>
                <div>
                  <p className="font-medium">Competitive Landscape</p>
                  <p className="text-sm text-muted-foreground">Competitor insights and advantages</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge className="mt-1">4</Badge>
                <div>
                  <p className="font-medium">Action Items</p>
                  <p className="text-sm text-muted-foreground">Prioritized recommendations</p>
                </div>
              </div>
            </div>
          </div>
          
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Reports can be downloaded as PDF files for sharing with your team or stakeholders. 
              All analyses are saved in your dashboard for future reference.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start leveraging AI for your business success',
      icon: <CheckCircle className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You're ready to start using KnowWhere Bridge Insights. Let's unlock your business potential with AI.
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Quick Tips
            </h4>
            <ul className="space-y-1 text-sm">
              <li>• Upload multiple documents for comprehensive analysis</li>
              <li>• Use custom prompts for specific insights</li>
              <li>• Compare analyses over time to track progress</li>
              <li>• Share reports with your team for collaboration</li>
            </ul>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Need help? Contact our support team anytime</span>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(new Set([...completedSteps, currentStep]));
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    toast({
      title: "Onboarding Complete",
      description: "Welcome to KnowWhere Bridge Insights!",
    });
    onComplete();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {step.icon}
            <Badge variant="outline">Step {currentStep + 1} of {steps.length}</Badge>
          </div>
          {onSkip && (
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip Tour
            </Button>
          )}
        </div>
        <Progress value={progress} className="h-2 mb-4" />
        <CardTitle>{step.title}</CardTitle>
        <CardDescription>{step.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {step.content}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStep
                  ? 'bg-primary'
                  : completedSteps.has(index)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <Button onClick={handleNext}>
          {currentStep === steps.length - 1 ? (
            <>
              Complete
              <CheckCircle className="h-4 w-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};