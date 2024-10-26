import React, {CSSProperties, MouseEventHandler, useEffect, useRef, useState} from "react";
import autosize from "autosize";
import "./index.scss"
import ShowMoreText from "react-show-more-text";
import {Tooltip} from "antd";
import {shortenString} from "../Sider";
import {Profile} from "../../declarations/user/user";

type Props = {
  open: boolean,
  setOpen: Function,
  replyContent: string,
  setReplyContent: Function,
  callBack: MouseEventHandler<HTMLDivElement>,
  rows?: number
}
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}
export const CommentInput = React.memo(({open, setOpen, replyContent, setReplyContent, callBack, rows = 3}: Props) => {
  const specifiedElementRef = useRef(null);
  const textareaRef = useRef<any>(null);

  const click = (event: any) => {
    //@ts-ignore
    if (!(specifiedElementRef.current && specifiedElementRef.current.contains(event.target))) {
      setOpen(false)
    }
  };

  useEffect(() => {
    document.addEventListener('click', click);
    return () => {
      document.removeEventListener('click', click);
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current);

      return () => {
        autosize.destroy(textareaRef.current);
      };
    }
  }, [textareaRef, open]);

  return <div onClick={e => {
    e.stopPropagation()
  }} ref={specifiedElementRef} style={{display: open ? "flex" : "none"}} className={"common_reply_wrap"}>
      <textarea ref={textareaRef} onChange={e => setReplyContent(e.target.value)}
                value={replyContent}
                name=""
                id=""
                rows={rows}
                placeholder={"Reply"}/>

    <div onClick={callBack} style={(() => {
      const canSend = replyContent.length > 0
      if (!canSend)
        return {
          background: "gray", cursor: "no-drop"
        }
    })()}>
      Send
    </div>

  </div>
})

export const ShowMoreTest = React.memo((props: {
  content: string,
  postId?: string,
  playOne?: string,
  setPlayOne?: Function,
  className?: string
}) => {
  const {content, className, postId} = props
  const [videoId, setVideoId] = useState<string[]>([])
  const formattedText = content.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      <LinkifyTextWithPreview text={line} setVideoId={setVideoId}/>
      <br/>
    </React.Fragment>
  ));

  return (
    <div>
      <ShowMoreText
        lines={7}
        more={"Show more"}
        less={"Show less"}
        truncatedEndingComponent={"...   "}
        className={className}
      >
        {formattedText}
      </ShowMoreText>
      {videoId.length > 0 && postId && <YouTubeEmbed  {...props} videoId={videoId[0]}/>}
    </div>
  );
})

const urlRegex = /(https?:\/\/[^\s]+)/g;

const isYouTubeUrl = (url: string) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
};

const getVideoId = (url: string) => {
  let videoId = '';
  if (url.includes('youtube.com')) {
    videoId = url.split('v=')[1];
  } else if (url.includes('youtu.be')) {
    videoId = url.split('/').pop() || '';
  }
  const ampersandPosition = videoId.indexOf('&');
  if (ampersandPosition !== -1) {
    videoId = videoId.substring(0, ampersandPosition);
  }
  return videoId
};

const LinkifyTextWithPreview = ({text, setVideoId}: { text: string, setVideoId: Function }) => {
  const parts = text.split(/(https?:\/\/[^\s]+|#\w+)/g);

  useEffect(() => {
    parts && parts.map(v => {
      if (urlRegex.test(v)) {
        if (isYouTubeUrl(v)) {
          const videoId = getVideoId(v);
          setVideoId((pre: string[]) => [...pre, videoId])
        }
      }
    })
  }, [parts])
  return (
    <div>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <div className="3" key={index}>
              <a style={{color: "#438EFF", wordWrap: "break-word"}} href={part} target="_blank"
                 rel="noopener noreferrer">
                {part}
              </a>
            </div>
          );
        } else if (part.startsWith('#')) {
          return (
            <div className="hashtag" key={index}>
              <a style={{color: "#438EFF", wordWrap: "break-word", textDecoration: "none"}}
                 href={`${window.location.origin}/tag?t=${part.slice(1, part.length)}`}
                 rel="noopener noreferrer">
                {part}
              </a>
            </div>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

let playerCounter = 0;

const YouTubeEmbed = ({videoId, postId, setPlayOne, playOne}: {
  videoId: string,
  playOne?: string,
  setPlayOne?: Function,
  postId?: string
}) => {
  const playerIdRef = useRef(`youtube-player-${playerCounter++}`);

  const isPlaying = React.useMemo(() => {
    return postId === playOne
  }, [postId, playOne])

  useEffect(() => {
    if (!isPlaying || !playerIdRef.current) return;

    const loadYouTubeAPI = () => {
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    };

    const initializeYouTubePlayer = () => {
      new (window as any).YT.Player(playerIdRef.current, {
        videoId: videoId,
        events: {
          'onReady': (event: any) => {
          },
        },
      });
    };

    loadYouTubeAPI();

    if ((window as any).YT && (window as any).YT.Player) {
      initializeYouTubePlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initializeYouTubePlayer;
    }

    return () => {
      const playerElement = document.getElementById(playerIdRef.current);
      if (playerElement) {
        playerElement.innerHTML = '';
      }
    };
  }, [videoId, isPlaying, playerIdRef]);

  const handleThumbnailClick = (e: any) => {
    e.stopPropagation()
    setPlayOne?.(postId)
  };
  if (!isPlaying) {
    return (
      <div onClick={handleThumbnailClick} style={{cursor: 'pointer'}}>
        <img
          src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
          alt="YouTube video thumbnail"
          style={{width: '100%', height: 'auto'}}
        />
      </div>
    );
  }

  return (
    <div id={playerIdRef.current} style={{width: '100%', height: '315px'}}></div>
  );
};

export const PostUserInfo = React.memo(({profile, time, imgStyle, nameStyle, handleStyle}: {
  profile: Profile | undefined,
  time?: string,
  imgStyle?: CSSProperties, nameStyle?: CSSProperties, handleStyle?: CSSProperties
}) => {
  const [avatar, setAvatar] = useState("")
  const [isLoad, setIsLoad] = useState(false)

  useEffect(() => {
    if (profile) {
      if (profile.avatar_url) setAvatar(profile.avatar_url)
      else setAvatar("/img_3.png")
    }
  }, [profile])

  const load = () => {
    setIsLoad(true)
  }

  return <div className={"user_info_author"}>
    <div style={{position: "relative"}}>
      <Tooltip title={profile?.name}>
        <img style={{...imgStyle}} className={"avatar"}
             onClick={(e) => {
               e.stopPropagation()
               window.open(`/profile/${profile?.id.toString()}`)
             }}
             src={avatar} alt="" onLoad={load}/>
      </Tooltip>
      <div className="skeleton skeleton-avatar" style={{display: !isLoad ? "block" : "none", ...imgStyle}}/>
    </div>
    <div style={{display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "center"}}>
      {profile ? <div
          style={{
            fontSize: "2.1rem",
            fontWeight: "500",
            fontFamily: "Fredoka, sans-serif", ...nameStyle
          }}>{profile.name}</div> :
        <div className="skeleton skeleton-title" style={{...nameStyle}}/>
      }
      <div style={{display: "flex", alignItems: "center", fontSize: "2rem", gap: "1rem", ...handleStyle}}>
        {profile ?
          <div style={{color: "rgb(132 137 168)"}}>{profile ? shortenString(profile.handle, 25) : ""}</div> :
          <div className="skeleton skeleton-text" style={{...handleStyle}}/>
        }
        {time && <React.Fragment>
          <span className="post_dot"/>
          <div style={{color: "rgb(132 137 168)"}}>
            {time}
          </div>
        </React.Fragment>}
      </div>
    </div>
  </div>
})


export const NumberInput = React.memo(({setAmount, placeholder, value, integer}: {
  setAmount: Function,
  value: number,
  placeholder?: string, integer?: boolean
}) => {

  return <input value={value} className={"number_input"} type="number" min={0} placeholder={placeholder ?? "0.00"}
                onChange={e => {
                  let value = e.target.value;
                  value = value.replace(/[^0-9.]/g, '');
                  value = value.replace(/^0+(?!\.|$)/, '');
                  if ((value.match(/\./g) || []).length > 1) {
                    value = value.replace(/\.(?=.*\.)/, '');
                  }
                  if (value.startsWith('-')) {
                    value = value.substring(1);
                  }
                  if (parseFloat(value) < 0) {
                    value = '';
                  }
                  if (integer) {
                    if (Number.isInteger(Number(value))) {
                      e.target.value = value;
                      setAmount(Number(value));
                    } else {
                      e.target.value = ""; // 确保输入框的值为0或空
                    }
                  } else {
                    e.target.value = value
                    setAmount(+value)
                  }


                }}/>
})


