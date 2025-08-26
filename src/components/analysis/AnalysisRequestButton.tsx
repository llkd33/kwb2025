import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, 
  Loader2, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Info,
  Download,
  Eye
} from 'lucide-react';

interface AnalysisRequestButtonProps {
  documentId?: number;
  documentName?: string;
  companyId: number;
  onAnalysisComplete?: (analysisId: number) => void;
}

export const AnalysisRequestButton: React.FC<AnalysisRequestButtonProps> = ({
  documentId,
  documentName,
  companyId,
  onAnalysisComplete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisType, setAnalysisType] = useState<'gpt' | 'perplexity'>('gpt');
  const [customPrompt, setCustomPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{
    id: number;
  } | null>(null);
  const [currentStep, setCurrentStep] = useState('');
  const { toast } = useToast();

  const analysisSteps = [
    { step: 'Preparing document', progress: 10 },
    { step: 'Extracting content', progress: 25 },
    { step: 'Analyzing with AI', progress: 50 },
    { step: 'Processing insights', progress: 75 },
    { step: 'Generating report', progress: 90 },
    { step: 'Finalizing', progress: 100 }
  ];

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisResult(null);

    try {
      // Simulate progress through steps
      for (const stepInfo of analysisSteps) {
        setCurrentStep(stepInfo.step);
        setProgress(stepInfo.progress);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (stepInfo.step === 'Analyzing with AI') {
          // Call the appropriate Supabase function
          const functionName = analysisType === 'gpt' ? 'run-gpt-analysis' : 'run-perplexity-analysis';
          
          const { data, error } = await supabase.functions.invoke(functionName, {
            body: {
              documentId,
              companyId,
              customPrompt: customPrompt || undefined,
              analysisOptions: {
                includeCompetitiveAnalysis: true,
                includeMarketInsights: true,
                includeRecommendations: true
              }
            }
          });

          if (error) throw error;
          
          // Store the analysis result
          const { data: analysisRecord, error: dbError } = await supabase
            .from('analysis_results')
            .insert({
              company_id: companyId,
              document_id: documentId,
              analysis_type: analysisType,
              result_data: data,
              custom_prompt: customPrompt || null,
              status: 'completed'
            })
            .select()
            .single();

          if (dbError) throw dbError;
          
          setAnalysisResult(analysisRecord);
        }
      }

      toast({
        title: "Analysis Complete",
        description: "Your document has been successfully analyzed.",
      });

      if (onAnalysisComplete && analysisResult?.id) {
        onAnalysisComplete(analysisResult.id);
      }
    } catch (err: unknown) {
      console.error('Analysis error:', err);
      toast({
        title: "Analysis Failed",
        description: err instanceof Error ? err.message : "An error occurred during analysis.",
        variant: "destructive",
      });
      setProgress(0);
      setCurrentStep('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = async () => {
    if (!analysisResult) return;

    try {
      // Generate PDF report
      const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
        body: {
          analysisId: analysisResult.id,
          companyId
        }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-report-${analysisResult.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Downloaded",
        description: "Your analysis report has been downloaded.",
      });
    } catch (error: unknown) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download the report.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2"
        variant="default"
      >
        <Sparkles className="h-4 w-4" />
        Request AI Analysis
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI-Powered Document Analysis</DialogTitle>
            <DialogDescription>
              {documentName ? `Analyze "${documentName}" with advanced AI` : 'Configure your AI analysis preferences'}
            </DialogDescription>
          </DialogHeader>

          {!isAnalyzing && !analysisResult && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Analysis Model</Label>
                <Select value={analysisType} onValueChange={(value: 'gpt' | 'perplexity') => setAnalysisType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt">
                      <div className="flex items-center gap-2">
                        <span>GPT-4 Analysis</span>
                        <span className="text-xs text-muted-foreground">(Comprehensive)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="perplexity">
                      <div className="flex items-center gap-2">
                        <span>Perplexity Analysis</span>
                        <span className="text-xs text-muted-foreground">(Research-focused)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Custom Instructions (Optional)</Label>
                <Textarea
                  placeholder="Add specific questions or areas you want the AI to focus on..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  The AI will analyze your document for market insights, competitive advantages, 
                  business opportunities, and provide actionable recommendations.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-4 py-8">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm font-medium">{currentStep}</p>
              </div>
              
              <Progress value={progress} className="h-2" />
              
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                {analysisSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {progress >= step.progress ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-gray-300" />
                    )}
                    <span className={progress >= step.progress ? 'text-foreground' : ''}>
                      {step.step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4 py-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Analysis completed successfully! Your insights are ready.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    // Navigate to analysis results page
                    window.location.href = `/analysis/${analysisResult.id}`;
                  }}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Results
                </Button>
                <Button
                  onClick={downloadReport}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            {!isAnalyzing && !analysisResult && (
              <>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={startAnalysis} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Start Analysis
                </Button>
              </>
            )}
            
            {analysisResult && (
              <Button onClick={() => setIsOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
