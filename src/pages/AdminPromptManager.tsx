import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit3, Save, Plus, Trash2, Copy, CheckCircle } from "lucide-react";

interface PromptTemplate {
  id: number;
  name: string;
  type: 'gpt' | 'perplexity';
  template: string;
  variables: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminPromptManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'gpt' as 'gpt' | 'perplexity',
    template: '',
    variables: {}
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "템플릿 로드 실패",
        description: "프롬프트 템플릿을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (template: PromptTemplate) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('prompt_templates')
        .update({
          template: template.template,
          variables: template.variables,
          updated_at: new Date().toISOString()
        })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "저장 완료",
        description: "프롬프트 템플릿이 업데이트되었습니다.",
      });

      setEditingId(null);
      fetchTemplates();
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newTemplate.name || !newTemplate.template) {
      toast({
        title: "입력 오류",
        description: "템플릿 이름과 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('prompt_templates')
        .insert({
          ...newTemplate,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "생성 완료",
        description: "새 프롬프트 템플릿이 생성되었습니다.",
      });

      setNewTemplate({
        name: '',
        type: 'gpt',
        template: '',
        variables: {}
      });
      fetchTemplates();
    } catch (error) {
      toast({
        title: "생성 실패",
        description: "생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (template: PromptTemplate) => {
    try {
      const { error } = await supabase
        .from('prompt_templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "상태 변경 완료",
        description: `템플릿이 ${!template.is_active ? '활성화' : '비활성화'}되었습니다.`,
      });

      fetchTemplates();
    } catch (error) {
      toast({
        title: "상태 변경 실패",
        description: "상태 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('이 템플릿을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('prompt_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "프롬프트 템플릿이 삭제되었습니다.",
      });

      fetchTemplates();
    } catch (error) {
      toast({
        title: "삭제 실패",
        description: "삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = (template: string) => {
    navigator.clipboard.writeText(template);
    toast({
      title: "복사 완료",
      description: "프롬프트가 클립보드에 복사되었습니다.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">프롬프트 템플릿 관리</h1>
        <p className="text-muted-foreground">
          GPT와 Perplexity API에 사용되는 프롬프트 템플릿을 관리합니다.
        </p>
      </div>

      {/* Create New Template */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>새 템플릿 생성</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-name">템플릿 이름</Label>
              <Input
                id="new-name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="예: comprehensive_analysis_gpt"
              />
            </div>
            <div>
              <Label htmlFor="new-type">AI 타입</Label>
              <Select 
                value={newTemplate.type} 
                onValueChange={(value: 'gpt' | 'perplexity') => 
                  setNewTemplate({ ...newTemplate, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt">GPT</SelectItem>
                  <SelectItem value="perplexity">Perplexity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="new-template">템플릿 내용</Label>
            <Textarea
              id="new-template"
              value={newTemplate.template}
              onChange={(e) => setNewTemplate({ ...newTemplate, template: e.target.value })}
              rows={10}
              placeholder="프롬프트 템플릿을 입력하세요. 변수는 {{variable_name}} 형식으로 사용하세요."
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={handleCreate} disabled={saving}>
            <Plus className="w-4 h-4 mr-2" />
            템플릿 생성
          </Button>
        </CardContent>
      </Card>

      {/* Existing Templates */}
      <div className="space-y-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {template.name}
                    <Badge variant={template.type === 'gpt' ? 'default' : 'secondary'}>
                      {template.type.toUpperCase()}
                    </Badge>
                    <Badge variant={template.is_active ? 'default' : 'outline'}>
                      {template.is_active ? '활성' : '비활성'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    마지막 수정: {new Date(template.updated_at).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(template.template)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(template)}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(editingId === template.id ? null : template.id)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingId === template.id ? (
                <div className="space-y-4">
                  <Textarea
                    value={template.template}
                    onChange={(e) => {
                      const updatedTemplates = templates.map(t => 
                        t.id === template.id ? { ...t, template: e.target.value } : t
                      );
                      setTemplates(updatedTemplates);
                    }}
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave(template)} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      저장
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)}>
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
                    {template.template}
                  </pre>
                  {template.variables && Object.keys(template.variables).length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">템플릿 변수:</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(template.variables).map(([key, value]) => (
                          <Badge key={key} variant="outline">
                            {`{{${key}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}