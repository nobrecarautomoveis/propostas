'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, StopCircle, Play, Loader2, Download, Clipboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { transcribeAndAnalyze } from '@/lib/actions';

type AnalysisResult = {
  transcription: string;
  summary: string;
  topics: string[];
  keywords: string[];
};

export function AudioRecorder() {
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'inactive' | 'recording'>('inactive');
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audio, setAudio] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mimeType = 'audio/webm';
  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (recordingStatus === 'recording') {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setTimer(0);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [recordingStatus]);

  const getMicrophonePermission = async () => {
    if ('MediaRecorder' in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setPermission(true);
        setStream(streamData);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Ocorreu um erro ao acessar o microfone.');
      }
    } else {
      alert('A API MediaRecorder não é suportada no seu navegador.');
    }
  };

  const startRecording = async () => {
    if (!stream) {
      if(!permission) await getMicrophonePermission();
      // This effect will re-run once stream is set
      return;
    }
    
    setRecordingStatus('recording');
    setAnalysisResult(null);
    setAudio(null);
    const media = new MediaRecorder(stream, { mimeType });
    mediaRecorder.current = media;
    mediaRecorder.current.start();
    let localAudioChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === 'undefined') return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);
  };

  // Re-run startRecording when stream becomes available after permission grant
  useEffect(() => {
    if (stream && recordingStatus === 'inactive' && permission && audioChunks.length === 0 && !audio) {
        // This is a bit of a hack to auto-start after permission.
        // The user experience is clicking "start" which first asks permission.
        // A better way would be to manage a 'wantsToRecord' state.
        // For this implementation, clicking Start again is fine.
    }
  }, [stream, permission, recordingStatus, audioChunks, audio]);

  const stopRecording = () => {
    setRecordingStatus('inactive');
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudio(audioUrl);
        setAudioChunks([]);
      };
    }
  };
  
  const handleAnalyze = async () => {
    if (!audio) return;
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const audioBlob = await fetch(audio).then(r => r.blob());
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const result = await transcribeAndAnalyze({ audioDataUri: base64Audio });
        if(result) {
          setAnalysisResult(result);
        } else {
          throw new Error('A análise não retornou resultados.');
        }
      };
    } catch (error) {
        console.error("Analysis failed:", error);
        toast({
          variant: "destructive",
          title: "Erro na Análise",
          description: error instanceof Error ? error.message : "Não foi possível analisar o áudio.",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${type} copiada!`, description: 'O conteúdo foi copiado para a área de transferência.' });
  }

  const handleExport = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Nova Gravação</CardTitle>
        <CardDescription>Grave uma nova conversa para transcrever e analisar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed rounded-lg">
          {recordingStatus === 'inactive' ? (
             <Button size="lg" onClick={permission ? startRecording : getMicrophonePermission}>
              <Mic className="mr-2 h-5 w-5" />
              {permission ? 'Iniciar Gravação' : 'Permitir Microfone'}
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-4">
               <div className="text-4xl font-mono text-primary animate-pulse">{formatTime(timer)}</div>
              <Button size="lg" variant="destructive" onClick={stopRecording}>
                <StopCircle className="mr-2 h-5 w-5" />
                Parar Gravação
              </Button>
            </div>
          )}
        </div>
        
        {audio && !isLoading && !analysisResult && (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <audio src={audio} controls className="w-full"></audio>
                </div>
                <Button onClick={handleAnalyze} className="w-full" size="lg">
                    <Play className="mr-2 h-4 w-4" />
                    Analisar Conversa
                </Button>
            </div>
        )}

        {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 text-primary p-8">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p className="text-lg font-medium">Analisando... Isso pode levar alguns instantes.</p>
            </div>
        )}

        {analysisResult && (
            <div className="space-y-6 pt-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Transcrição</CardTitle>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleCopy(analysisResult.transcription, 'Transcrição')}> <Clipboard className="h-4 w-4" /> </Button>
                          <Button variant="outline" size="icon" onClick={() => handleExport(analysisResult.transcription, 'transcricao.txt')}> <Download className="h-4 w-4" /> </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-64 rounded-md border p-4">
                            <p className="text-sm whitespace-pre-wrap">{analysisResult.transcription}</p>
                        </ScrollArea>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Resumo Inteligente</CardTitle>
                         <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleCopy(analysisResult.summary, 'Resumo')}> <Clipboard className="h-4 w-4" /> </Button>
                          <Button variant="outline" size="icon" onClick={() => handleExport(analysisResult.summary, 'resumo.txt')}> <Download className="h-4 w-4" /> </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{analysisResult.summary}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Tópicos e Palavras-chave</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {analysisResult.topics.map(topic => <Badge key={topic} variant="secondary">{topic}</Badge>)}
                        {analysisResult.keywords.map(keyword => <Badge key={keyword}>{keyword}</Badge>)}
                    </CardContent>
                </Card>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
