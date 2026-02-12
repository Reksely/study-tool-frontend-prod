"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  CheckCircle,
  Trash2,
  Video,
  Play,
  Download,
  RefreshCw,
  X,
} from "lucide-react";
import { Study, Topic, VideoProgress } from "../types";

const API_URL = "http://localhost:3005/api";

interface TikTokVideoTabProps {
  study: Study;
  setStudy: React.Dispatch<React.SetStateAction<Study | null>>;
  studyId: string;
}

// Get progress message for video generation
const getVideoProgressMessage = (status: string, progress?: number, error?: string) => {
  switch (status) {
    case "generating_script":
      return "✍️ AI is writing your TikTok script...";
    case "started":
      return "🎬 Starting video generation...";
    case "generating_audio":
      return `🎵 Generating audio... ${progress || 0}%`;
    case "audio_complete":
      return "✅ Audio generation complete";
    case "generating_captions":
      return `🔄 Generating captions... ${progress || 0}%`;
    case "bundling":
      return `📦 AI editing the video... ${progress || 0}%`;
    case "rendering":
      return `🎥 Rendering: ${progress || 0}%`;
    case "complete":
      return "✨ Rendering complete!";
    case "error":
      return "❌ Error: " + (error || "Unknown error");
    default:
      return status || "⏳ Waiting in queue...";
  }
};

export function TikTokVideoTab({ study, setStudy, studyId }: TikTokVideoTabProps) {
  const [generatingVideoForTopic, setGeneratingVideoForTopic] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState<VideoProgress | null>(null);
  const [watchingVideo, setWatchingVideo] = useState<{ url: string; title: string } | null>(null);

  // Video generation via WebSocket
  const generateVideo = async (topicId: string) => {
    setGeneratingVideoForTopic(topicId);
    setVideoProgress({ status: 'generating_script' });
    
    // Mark as generating in UI
    setStudy(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        topics: prev.topics?.map(t => 
          t.id === topicId ? { ...t, videoGenerating: true } : t
        )
      };
    });

    try {
      // Get AI-generated TikTok script from backend
      const scriptRes = await fetch(`${API_URL}/studies/${studyId}/topics/${topicId}/script`, {
        credentials: "include",
      });
      
      if (!scriptRes.ok) {
        throw new Error("Failed to generate script");
      }
      
      const { script } = await scriptRes.json();
      
      // Connect to WebSocket for video generation
      const videoUrl = await new Promise<string>((resolve, reject) => {
        const ws = new WebSocket('wss://backend.korpi.ai');
        
        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error('Video generation timed out'));
        }, 300000); // 5 minute timeout

        ws.onopen = () => {
          setVideoProgress({ status: 'started' });
          ws.send(JSON.stringify({
            type: 'generate-rant-for-study',
            script: script
          }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'generate-rant-for-study') {
              setVideoProgress({ 
                status: message.status || 'started', 
                progress: message.progress,
                error: message.error
              });
              
              if (message.status === 'complete') {
                clearTimeout(timeout);
                ws.close();
                resolve(message.videoUrl);
              } else if (message.status === 'error') {
                clearTimeout(timeout);
                ws.close();
                reject(new Error(message.error || 'Video generation failed'));
              }
            } else if (message.status && message.status !== 'pong') {
              setVideoProgress({ 
                status: message.status, 
                progress: message.progress 
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error('WebSocket error:', error);
          reject(new Error('Connection error'));
        };

        ws.onclose = () => {
          clearTimeout(timeout);
        };
      });

      // Save video URL to backend
      await fetch(`${API_URL}/studies/${studyId}/topics/${topicId}/video`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl })
      });
      
      // Update UI with video URL
      setStudy(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          topics: prev.topics?.map(t => 
            t.id === topicId ? { ...t, videoUrl, videoGenerating: false } : t
          )
        };
      });
    } catch (err) {
      console.error("Video generation error:", err);
      setStudy(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          topics: prev.topics?.map(t => 
            t.id === topicId ? { ...t, videoGenerating: false } : t
          )
        };
      });
      alert(err instanceof Error ? err.message : "Failed to generate video");
    } finally {
      setGeneratingVideoForTopic(null);
      setVideoProgress(null);
    }
  };

  const deleteVideo = async (topicId: string) => {
    try {
      const res = await fetch(`${API_URL}/studies/${studyId}/topics/${topicId}/video`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (res.ok) {
        setStudy(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            topics: prev.topics?.map(t => 
              t.id === topicId ? { ...t, videoUrl: null } : t
            )
          };
        });
      }
    } catch (err) {
      console.error("Delete video error:", err);
    }
  };

  const generateAllVideos = async () => {
    const topicsWithoutVideos = study.topics?.filter(t => !t.videoUrl && !t.videoGenerating) || [];
    for (const topic of topicsWithoutVideos) {
      await generateVideo(topic.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      {study.topics && study.topics.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Progress
            </CardTitle>
            <CardDescription>
              {study.topics.filter(t => t.videoUrl).length} of {study.topics.length} videos generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {Math.round((study.topics.filter(t => t.videoUrl).length / study.topics.length) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(study.topics.filter(t => t.videoUrl).length / study.topics.length) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topics List */}
      <div className="space-y-3">
        {study.topics?.map((topic, index) => {
          const isGenerating = generatingVideoForTopic === topic.id || topic.videoGenerating;
          const hasVideo = !!topic.videoUrl;
          
          return (
            <Card 
              key={topic.id} 
              className={`transition-all ${
                hasVideo 
                  ? "border-green-500/50" 
                  : isGenerating 
                    ? "border-primary/50"
                    : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Unit Number */}
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium shrink-0 ${
                    hasVideo 
                      ? "bg-green-500/10 text-green-500"
                      : isGenerating
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {hasVideo ? <CheckCircle className="h-5 w-5" /> : index + 1}
                  </div>
                  
                  {/* Topic Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{topic.title}</h3>
                    {hasVideo && !isGenerating && (
                      <p className="text-xs text-green-500">Video ready</p>
                    )}
                    {isGenerating && generatingVideoForTopic === topic.id && videoProgress && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">
                          {getVideoProgressMessage(videoProgress.status, videoProgress.progress, videoProgress.error)}
                        </p>
                        {videoProgress.progress !== undefined && (
                          <div className="h-1.5 w-40 rounded-full bg-muted overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${videoProgress.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {isGenerating && generatingVideoForTopic !== topic.id && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Waiting...
                      </p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {hasVideo ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setWatchingVideo({ url: `https://backend.korpi.ai${topic.videoUrl}`, title: topic.title })}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Watch
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `https://backend.korpi.ai${topic.videoUrl}`;
                            link.download = `${topic.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => generateVideo(topic.id)}
                          disabled={isGenerating}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteVideo(topic.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => generateVideo(topic.id)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Video className="h-4 w-4 mr-2" />
                            Generate
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Generate All Button */}
      {study.topics && study.topics.some(t => !t.videoUrl) && (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center">
            <h3 className="font-medium mb-1">Generate All Videos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate videos for all {study.topics.filter(t => !t.videoUrl).length} remaining units
            </p>
            <Button
              onClick={generateAllVideos}
              disabled={!!generatingVideoForTopic}
            >
              <Video className="h-4 w-4 mr-2" />
              Generate All
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All Done Message */}
      {study.topics && study.topics.every(t => t.videoUrl) && (
        <Card className="border-green-500/50">
          <CardContent className="py-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-medium mb-1">All Videos Generated</h3>
            <p className="text-sm text-muted-foreground">
              All {study.topics.length} videos are ready to watch
            </p>
          </CardContent>
        </Card>
      )}

      {/* Video Player Modal */}
      {watchingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl mx-4">
            {/* Close button */}
            <button
              onClick={() => setWatchingVideo(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors flex items-center gap-2"
            >
              <span className="text-sm">Close</span>
              <X className="h-6 w-6" />
            </button>
            
            {/* Video title */}
            <div className="mb-4 text-center">
              <h3 className="text-xl font-semibold text-white">{watchingVideo.title}</h3>
            </div>
            
            {/* Video player */}
            <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl">
              <video
                src={watchingVideo.url}
                controls
                autoPlay
                className="w-full max-h-[70vh] object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            
            {/* Actions below video */}
            <div className="mt-4 flex justify-center gap-3">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = watchingVideo.url;
                  link.download = `${watchingVideo.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
                  link.click();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Video
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => window.open(watchingVideo.url, '_blank')}
              >
                <Play className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

