"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, VolumeX, Volume2 } from "lucide-react";
import { AboutSectionConfig, DEFAULT_ABOUT_CONFIG } from "@/types/branding";

export function getYoutubeVideoId(input?: string): string {
  if (!input) return "mbBugyspbPE";
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/
  );
  if (match && match[1]) {
    return match[1];
  }
  return "mbBugyspbPE";
}

interface AboutVideoPlayerProps {
  config?: AboutSectionConfig;
  videoUrl?: string;
  className?: string;
}

export function AboutVideoPlayer({
  config = DEFAULT_ABOUT_CONFIG,
  videoUrl,
  className = "",
}: AboutVideoPlayerProps) {
  const activeConfig = { ...DEFAULT_ABOUT_CONFIG, ...config };
  const rawUrl = videoUrl || activeConfig.videoUrl || "https://www.youtube.com/watch?v=mbBugyspbPE";
  const resolvedVideoId = getYoutubeVideoId(rawUrl);
  const isDirectMp4 =
    rawUrl.endsWith(".mp4") ||
    rawUrl.endsWith(".webm") ||
    rawUrl.includes("clinic-tour") ||
    resolvedVideoId === "mbBugyspbPE";

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoElemRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(activeConfig.startMuted !== false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Playback quality is configured and controlled directly via the Admin Panel
  const activeQuality = activeConfig.defaultQuality || "hd1080";

  const effectiveDirectSrc =
    rawUrl.endsWith(".mp4") || rawUrl.endsWith(".webm")
      ? rawUrl
      : activeQuality === "hd720"
      ? "/videos/clinic-tour-720p.mp4"
      : "/videos/clinic-tour-1080p.mp4";

  const inViewRef = useRef(false);
  const userPausedRef = useRef(false);

  // Send control command to YouTube iframe via postMessage
  const postCommand = useCallback((command: string, ...args: any[]) => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: command,
          args: args.length > 0 ? args : [],
        }),
        "*"
      );
    } catch {
      // Safe fallback
    }
  }, []);

  // Enforce configured quality (1080p, 720p, etc.)
  const enforceQuality = useCallback((qualityKey?: string) => {
    const q = qualityKey || activeQuality || activeConfig.defaultQuality || "hd1080";
    postCommand("setPlaybackQuality", q);
    postCommand("setPlaybackQualityRange", q, q === "hd1080" ? "highres" : q);
    if (q === "hd1080") {
      postCommand("setPlaybackQuality", "highres");
      postCommand("setPlaybackQualityRange", "highres", "highres");
    }
  }, [postCommand, activeQuality, activeConfig.defaultQuality]);

  // Turn off closed captions
  const disableCaptions = useCallback(() => {
    postCommand("unloadModule", "captions");
    postCommand("setOption", "captions", "track", {});
    postCommand("setOption", "cc", "track", {});
  }, [postCommand]);

  const playVideo = useCallback(() => {
    if (isDirectMp4 && videoElemRef.current) {
      videoElemRef.current.play().catch(() => {});
      setIsPlaying(true);
      return;
    }

    postCommand("playVideo");
    enforceQuality();
    disableCaptions();
    setIsPlaying(true);

    // Multi-interval re-assertion
    [200, 600, 1200, 2500].forEach((delay) => {
      setTimeout(() => {
        enforceQuality();
        disableCaptions();
      }, delay);
    });
  }, [isDirectMp4, postCommand, enforceQuality, disableCaptions]);

  const pauseVideo = useCallback(() => {
    if (isDirectMp4 && videoElemRef.current) {
      videoElemRef.current.pause();
      setIsPlaying(false);
      return;
    }

    postCommand("pauseVideo");
    setIsPlaying(false);
  }, [isDirectMp4, postCommand]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      userPausedRef.current = true;
      pauseVideo();
    } else {
      userPausedRef.current = false;
      playVideo();
    }
  }, [isPlaying, pauseVideo, playVideo]);

  const toggleMute = () => {
    if (isDirectMp4 && videoElemRef.current) {
      videoElemRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      return;
    }

    if (isMuted) {
      postCommand("unMute");
      postCommand("setVolume", 85);
      setIsMuted(false);
    } else {
      postCommand("mute");
      setIsMuted(true);
    }
  };

  const [origin, setOrigin] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Sync YouTube player states via postMessage
  useEffect(() => {
    if (isDirectMp4) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.event === "infoDelivery" && data.info?.playerState !== undefined) {
          // 1: PLAYING, 2: PAUSED, 0: ENDED, 3: BUFFERING
          if (data.info.playerState === 1 || data.info.playerState === 3) {
            setIsPlaying(true);
            enforceQuality();
          } else if (data.info.playerState === 2) {
            setIsPlaying(false);
          } else if (data.info.playerState === 0) {
            postCommand("seekTo", 0);
            postCommand("playVideo");
            setIsPlaying(true);
            enforceQuality();
          }
        }
      } catch {
        // Safe fallback
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isDirectMp4, postCommand, enforceQuality]);

  // Autoplay on Scroll (IntersectionObserver)
  useEffect(() => {
    if (!activeConfig.autoplayOnScroll) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const inView = entry.isIntersecting;
        inViewRef.current = inView;

        if (inView && !document.hidden) {
          if (!userPausedRef.current) {
            playVideo();
            setTimeout(() => {
              if (inViewRef.current && !document.hidden && !userPausedRef.current) {
                playVideo();
              }
            }, 500);
          }
        } else {
          pauseVideo();
        }
      },
      {
        threshold: 0.25,
        rootMargin: "0px 0px 50px 0px",
      }
    );

    observer.observe(container);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseVideo();
      } else if (inViewRef.current && !userPausedRef.current) {
        playVideo();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeConfig.autoplayOnScroll, playVideo, pauseVideo]);

  // Embed URL with highres params, no controls, no captions, no recommendations
  const currentQualityParam =
    activeQuality === "auto" ? "hd1080" : activeQuality || "hd1080";
  const embedUrl = `https://www.youtube.com/embed/${resolvedVideoId}?enablejsapi=1&autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&hd=1&vq=${currentQualityParam}&highres=1&cc_load_policy=0&cc_lang_pref=none${
    origin ? `&origin=${encodeURIComponent(origin)}` : ""
  }`;

  // Container width class from config
  const sizeClass = activeConfig.videoSize || "max-w-4xl";

  return (
    <div
      ref={containerRef}
      className={`group relative mx-auto w-full ${sizeClass} ${className}`}
    >
      {/* Outer Aesthetic Card Frame */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-black/10 dark:border-white/10 bg-[#0e0f12] shadow-2xl transition-all duration-300">
        
        {/* 16:9 Aspect Ratio Container with Overflow Hidden */}
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          
          {isDirectMp4 ? (
            /* True 1080p Full HD Native Video Player */
            <video
              ref={videoElemRef}
              src={effectiveDirectSrc}
              poster="/videos/clinic-tour-poster.jpg"
              muted={isMuted}
              playsInline
              loop
              preload="none"
              autoPlay={activeConfig.autoplayOnScroll}
              className="absolute inset-0 h-full w-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            /* YouTube Player with Direct 1:1 Sharp Scaling */
            <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
              <iframe
                ref={iframeRef}
                src={embedUrl}
                title="CA Smile Clinic Tour & Experience"
                className="border-0 pointer-events-none transition-opacity duration-500 origin-center absolute inset-0 w-full h-full"
                style={{ opacity: isLoaded ? 1 : 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                onLoad={() => {
                  setIsLoaded(true);
                  try {
                    iframeRef.current?.contentWindow?.postMessage(
                      JSON.stringify({ event: "listening" }),
                      "*"
                    );
                  } catch {
                    // Safe fallback
                  }
                  enforceQuality();
                  disableCaptions();
                  if (inViewRef.current && !document.hidden && !userPausedRef.current) {
                    playVideo();
                    setTimeout(() => {
                      if (!userPausedRef.current) {
                        playVideo();
                        enforceQuality();
                      }
                    }, 400);
                  }
                }}
              />
            </div>
          )}

          {/* Centered Modern Play Button Overlay (visible when paused) */}
          <div
            className={`pointer-events-none absolute inset-0 z-15 flex flex-col items-center justify-center transition-all duration-300 ${
              isPlaying ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
            }`}
          >
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md border border-white/80 ring-4 ring-black/20 transition-transform duration-200 group-hover:scale-110">
              <Play className="h-7 w-7 sm:h-8 sm:w-8 fill-neutral-900 text-neutral-900 ml-1" />
            </div>
            <span className="mt-3 rounded-full bg-black/75 backdrop-blur-md px-3.5 py-1 text-[11px] sm:text-xs font-semibold text-white tracking-wide shadow-lg border border-white/10">
              Click to Play • Audio Available
            </span>
          </div>

          {/* Interactive Screen Click Shield: click video to Play/Pause, blocks native YouTube overlays */}
          <div
            onClick={togglePlayPause}
            className="absolute inset-0 z-20 select-none bg-transparent pointer-events-auto cursor-pointer"
            aria-label={isPlaying ? "Click to pause video" : "Click to play video"}
            title={isPlaying ? "Click to pause video" : "Click to play video"}
          />

          {/* Subtle Ambient Vignettes on edges for cinematic framing */}
          <div className="pointer-events-none absolute inset-0 z-25 rounded-2xl sm:rounded-3xl shadow-[inset_0_0_60px_rgba(0,0,0,0.45)]" />
          <div className="pointer-events-none absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-black/50 via-transparent to-transparent z-25" />

          {/* Bottom Downside Controls Bar: Play/Pause on mobile, plus Audio on desktop */}
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 flex items-center justify-end pointer-events-none">
            {/* Right Controls: Only Play/Pause on mobile; Audio Toggle on desktop */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Realistic White Play/Pause Button (Visible on mobile & desktop) */}
              <button
                type="button"
                onClick={togglePlayPause}
                className="group flex items-center gap-1.5 sm:gap-2 rounded-full bg-white text-neutral-900 px-3.5 py-1.5 sm:px-4 sm:py-1.5 text-xs font-bold tracking-tight shadow-[0_4px_16px_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_1px_rgba(0,0,0,0.08)] border border-white/80 ring-1 ring-black/10 transition-all duration-200 hover:bg-neutral-50 hover:scale-105 active:scale-95 active:shadow-[0_2px_6px_rgba(0,0,0,0.25)] cursor-pointer"
                aria-label={isPlaying ? "Pause video" : "Play video"}
                title={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5 fill-neutral-900 text-neutral-900" />
                    <span className="text-[11px] font-bold">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-neutral-900 text-neutral-900 ml-0.5" />
                    <span className="text-[11px] font-bold">Play</span>
                  </>
                )}
              </button>

              {/* Realistic White Audio Toggle Button (Hidden on mobile, visible on sm+) */}
              <button
                type="button"
                onClick={toggleMute}
                className="hidden sm:flex group items-center gap-1.5 rounded-full bg-white text-neutral-900 px-3.5 py-1.5 text-xs font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_1px_rgba(0,0,0,0.08)] border border-white/80 ring-1 ring-black/10 transition-all duration-200 hover:bg-neutral-50 hover:scale-105 active:scale-95 active:shadow-[0_2px_6px_rgba(0,0,0,0.25)] cursor-pointer"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
                title={isMuted ? "Click to unmute" : "Click to mute"}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="text-[11px] font-medium text-neutral-600">Muted</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-teal-600 fill-teal-600/20" />
                    <span className="text-[11px] font-bold text-teal-700">Audio On</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutVideoPlayer;
