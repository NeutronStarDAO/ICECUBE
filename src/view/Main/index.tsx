import "./index.scss"

import React, {forwardRef, useEffect, useMemo, useRef, useState} from 'react';
import Icon from "../../Icons/Icon";
import {useLocation, useNavigate} from "react-router-dom";
import {Post as postType} from "../../declarations/feed/feed";
import {Empty, message, notification, Tooltip} from "antd";
import {useAuth} from "../../utils/useAuth";
import Feed from "../../actors/feed";
import {rootPostApi} from "../../actors/root_bucket";
import {userApi} from "../../actors/user";
import {Profile} from "../../declarations/user/user";
import {updateSelectPost, useSelectPostStore} from "../../redux/features/SelectPost";
import {getTime, isIn} from "../../utils/util";
import {CommentInput, PostUserInfo, ShowMoreTest} from "../../components/Common";
import {Loading} from "../../components/Loading";
import {LikeList} from "../../components/LikeList";
import {Grant} from "../../components/Modal/Grant";
import {AssetPost} from "../Trade";
import {tradeApi, tradeCid} from "../../actors/trade";
import {Trade} from "../../components/Modal/Trade";
import {test_icp_api} from "../../actors/test_icp";
import {Principal} from "@dfinity/principal";

const pageCount = 5

export const Main = forwardRef((_, ref: any) => {
  const location = useLocation()
  const navigate = useNavigate()
  const {userFeedCai, isAuth, principal} = useAuth()
  const [homeData, setHomeData] = useState<postType[]>()
  const [exploreData, setExploreData] = useState<postType[]>()
  const [page, setPage] = useState(0);
  const [isEnd, setIsEnd] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showLikeList, setShowLikeList] = useState(false)
  const [likeUsers, setLikeUsers] = useState<Profile[]>()
  const {post: selectPost} = useSelectPostStore()
  const loader = useRef(null)


  const data = React.useMemo(() => {
    return location.pathname === "/explore" ? exploreData : homeData
  }, [homeData, exploreData])

  const change = () => {
    if (isAuth === false)
      navigate("/explore")
  }
  const Title = React.useMemo(() => {
    setHomeData(undefined)
    setExploreData(undefined)
    setProfiles([])
    setPage(0)
    setIsEnd(false)
    setShowLikeList(false)
    if (location.pathname === "/explore") return "Explore"
    return "Home"
  }, [location.pathname])

  useEffect(() => {
    !isAuth && change()
  }, [isAuth, Title])

  const getHomeData = React.useCallback(async () => {
    if (!userFeedCai || !principal) return 0
    const feedApi = new Feed(userFeedCai)
    const res = await feedApi.getHomeFeedByLength(principal, page * pageCount, pageCount)
    if (page === 0) {
      if (res.length < pageCount) setIsEnd(true)
      return setHomeData(res);
    }
    if (res.length < pageCount || res.length === 0) setIsEnd(true)
    const newArr = [...(data ?? []), ...res]
    setHomeData(newArr);
  }, [page, userFeedCai, principal])

  const getExploreData = React.useCallback(async () => {
    const res = await rootPostApi.get_buckets_latest_feed_from_start(page * pageCount, pageCount)
    if (page === 0) {
      if (res.length < pageCount) setIsEnd(true)
      return setExploreData(res);
    }
    if (res.length < pageCount || res.length === 0) setIsEnd(true)
    const newArr = [...(data ?? []), ...res]
    setExploreData(newArr);
  }, [page])

  useEffect(() => {
    data && userApi.batchGetProfile(data.map(v => v.user)).then(e => setProfiles(e))
  }, [data]);

  useEffect(() => {
    if (Title === "Explore") getExploreData()
  }, [Title, getExploreData])

  useEffect(() => {
    if (Title === "Home") getHomeData()
  }, [Title, getHomeData]);


  useEffect(() => {
    const ob = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1)
      }
    }, {threshold: 0})

    loader.current && ob.observe(loader.current)

    return () => {
      loader.current && ob.unobserve(loader.current)
    }
  }, [loader.current])


  return <>
    <LikeList style={{display: showLikeList ? "flex" : "none"}} backApi={() => {
      setShowLikeList(false)
      setLikeUsers(undefined)
    }}
              users={likeUsers}/>
    <div ref={ref} style={{display: showLikeList ? "none" : "flex"}} id={"content_main"}
         className={"main_wrap scroll_main"}>
      <div className={"title"}>{Title}</div>
      {data ? data.length === 0 ? <Empty style={{width: "100%"}}/>
        : data.map((v, k) => {
          return <Post setLikeUsers={setLikeUsers} key={k} profile={profiles[k]}
                       selectedID={selectPost ? selectPost.post_id : ""}
                       updateFunction={Title === "Explore" ? getExploreData : getHomeData}
                       post={v} setShowLikeList={setShowLikeList}/>
        }) : <Loading isShow={true} style={{width: "100%"}}/>}
      <div ref={loader} style={{width: "100%", display: data && !isEnd ? "" : "none"}}>
        <Loading isShow={true} style={{width: "100%"}}/>
      </div>
    </div>
  </>

})

export const Post = ({post, updateFunction, selectedID, profile, setShowLikeList, setLikeUsers, isTrade}: {
  post: AssetPost | postType,
  updateFunction: Function,
  selectedID: string, profile?: Profile, setShowLikeList: Function, setLikeUsers: Function, isTrade?: boolean
}) => {
  const principal = post.user
  const location = useLocation()
  const {principal: user_id, isDark} = useAuth()
  const [hoverOne, setHoverOne] = useState(-1)
  const [replyContent, setReplyContent] = useState("")
  const [open, setOpen] = useState(false)
  const {post: selectPost} = useSelectPostStore()
  const moreButton = useRef(null);
  const [showMore, setShowMore] = useState(false)
  const postRef = useRef(null)
  const [like, setLike] = useState(false)
  const [openGrant, setOpenGrant] = useState(false)
  const [showSending, setShowSending] = useState(false)
  const [playOne, setPlayOne] = useState("")

  const arg = useMemo(() => {
    const res = {
      time: getTime(post.created_at),
      isLike: false, isRepost: false

    }
    if (!user_id) return res

    res.isLike = isIn(user_id.toText(), post.like.map(v => v.user.toText()))
    res.isRepost = isIn(user_id.toString(), post.repost.map(v => v.user.toText()))
    return res
  }, [post, user_id])

  const isMy = useMemo(() => {
    if (!user_id) return false
    return user_id.toText() === principal.toText()
  }, [user_id, principal])

  const sendReply = async () => {
    if (replyContent.length <= 0) return 0
    const feedApi = new Feed(post.feed_canister)
    try {
      setShowSending(true)
      setOpen(false)
      await feedApi.createComment(post.post_id, replyContent)
      const res = await feedApi.getPost(post.post_id)
      if (res.length !== 0) {
        updateSelectPost({post: res[0]})
      }
    } catch (e) {
      message.error('Send failed !')
    } finally {
      updateFunction()
      setShowSending(false)
    }
  }

  const getLikeUsers = async () => {
    const likes = post.like
    const ids = likes.map(v => v.user)
    const res = await userApi.batchGetProfile(ids)
    setLikeUsers(res)
  }

  const handleClick = async (index: number) => {
    const feedApi = new Feed(post.feed_canister)

    if (index === 1) {
      setOpen(true)
      return
    }
    if (index === 3) {
      getLikeUsers()
      setShowLikeList(true)
      return
    }
    if (index === 5) {
      setOpenGrant(true)
      return
    }
    try {
      if (index === 0) { // like
        setLike(true)
        await feedApi.createLike(post.post_id)
      } else if (index === 2) { // repost
        await feedApi.createRepost(post.post_id)
      }
      updateFunction()
    } catch (e) {
      message.error("failed !")
    }
  }

  const click = (event: any) => {
    //@ts-ignore
    if (!(moreButton.current && moreButton.current.contains(event.target))) {
      setShowMore(false)
    } else {
      setShowMore(true)
    }
  };

  useEffect(() => {
    document.addEventListener('click', click);
    return () => {
      document.removeEventListener('click', click);
    };
  }, []);

  useEffect(() => {
    setReplyContent("")
  }, [open])

  useEffect(() => {
    if (selectPost && selectPost.post_id === post.post_id) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting)
            updateSelectPost({})
        },
        {
          root: null, // 默认是视口
          rootMargin: '0px',
          threshold: 0.1, // 元素进入视口10%时触发
        }
      );

      if (postRef.current) {
        observer.observe(postRef.current);
      }

      // 清理
      return () => {
        if (postRef.current) {
          observer.unobserve(postRef.current);
        }
      };
    }
  }, [selectPost]);

  const deletePost = async () => {
    const feedApi = new Feed(post.feed_canister)
    try {
      await feedApi.deletePost(post.post_id)
      updateFunction()
    } catch (e) {
      message.error('failed !')
    }
  }
  const hide = async () => {
    const feedApi = new Feed(post.feed_canister)
    try {
      message.loading('Hiding...')
      const res = await feedApi.add_feed_to_black_list(post.post_id)
      if (res) {
        message.success('Hidden successfully !')
      } else {
        message.warning('Hidden failed !')
      }
      updateFunction()
    } catch (e) {
      message.error('failed !')
    }
  }

  return <>
    <Grant open={openGrant} setOpen={setOpenGrant} profile={profile}/>
    <div ref={postRef}
         className={`post_main ${isDark ? "dark_post_main" : ""} ${(selectedID === post.post_id) ? isDark ? "dark_selected_post" : "selected_post" : ""}`}
         onClick={(e) => {
           if ("className" in e.target && e.target.className === "show-more-less-clickable") {
             return 0
           }
           updateSelectPost({}).then(() => updateSelectPost({post}))
         }}
    >
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <PostUserInfo profile={profile} time={arg.time}/>
        <div className={"dropdown_select_modal"}
             style={{position: "relative", display: location.pathname === "/explore" ? "none" : "block"}}>
          <div ref={moreButton} className={"more_wrap"} onClick={e => {
            e.stopPropagation()
            setShowMore(true)
          }}>
            <div>
              <Icon name={"more"}/>
            </div>
          </div>
          <div className={"dropdown_wrap"} style={{display: showMore ? "flex" : "none", zIndex: '100'}}>
            <div style={{display: isMy ? "none" : "flex"}} onClick={hide}>
              <Icon name={"hide"}/> Hide
            </div>
            <div onClick={deletePost} style={{display: isMy ? "flex" : "none"}}>
              <Icon name={"trash"}/>Delete
            </div>
          </div>
        </div>
      </div>
      <div className={"tweet"}>
        <ShowMoreTest playOne={playOne} setPlayOne={setPlayOne} postId={post.post_id} content={post.content}/>
        <div className={"img_list"} style={{
          gridTemplateColumns: post.photo_url.length === 1 ? "1fr" : "repeat(2, 1fr)",
          height: post.photo_url.length === 0 ? "0" : "50rem",
          minHeight: post.photo_url.length === 0 ? "0" : "50rem",
        }}>
          {post.photo_url.map((v, k) => {
            return <ImagePreview key={k} src={v} imageCount={post.photo_url.length}/>
          })}
        </div>
      </div>
      <BottomButton isTrade={isTrade} post={post} like={like} arg={arg} handleClick={handleClick} hoverOne={hoverOne}
                    setHoverOne={setHoverOne} showSending={showSending}/>
      <CommentInput setOpen={setOpen} open={open} replyContent={replyContent} setReplyContent={setReplyContent}
                    callBack={sendReply}/>
      {isTrade && <TradePrice assetPost={post} updateFunction={updateFunction}/>}
    </div>
  </>
}


const TradePrice = React.memo(({assetPost, updateFunction}: {
  assetPost: AssetPost | postType,
  updateFunction?: Function
}) => {
  const [price, setPrice] = useState<number>()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"buy" | "sell">("buy")
  const [amount, setAmount] = useState(0)
  const {principal} = useAuth()
  const [icpAmount, setIcpAmount] = useState(0)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    const getBalance = async () => {
      if (!principal) return
      if (!("id" in assetPost)) return
      const res = await tradeApi.icrc1_balance_of(assetPost.id, principal)
      setBalance(res)
    }
    getBalance()
  }, []);

  useEffect(() => {
    const get_buy_price = async () => {
      if (!("id" in assetPost)) return
      const res = await tradeApi.get_buy_price(assetPost.id, BigInt(Math.floor(amount * 1e8)))
      setIcpAmount(res / 1e8)
    }
    const get_sell_price = async () => {
      if (!("id" in assetPost)) return
      const res = await tradeApi.get_sell_price(assetPost.id, BigInt(Math.floor(amount * 1e8)))
      setIcpAmount(res / 1e8)
    }

    const timer = setTimeout(() => {
      const api = type === "buy" ? get_buy_price : get_sell_price
      api().catch(e => {
        console.log(e)
        setIcpAmount(0)
      })
    }, 500)
    return () => {
      clearTimeout(timer)
    }

  }, [amount, assetPost, type]);

  const getPrice = async () => {
    if (!("id" in assetPost)) return
    const res = await tradeApi.get_buy_price(assetPost.id, BigInt(1e8))
    setPrice(res)
  }

  useEffect(() => {
    getPrice()
  }, [assetPost]);

  const buyAsset = async () => {
    if (!principal) return
    if (amount <= 0) return
    try {
      setOpen(false)
      message.loading("pending...")
      const mint = await test_icp_api.mint(principal, icpAmount)
      if (!mint) throw new Error("mint failed")
      if ("id" in assetPost) {
        const res = await tradeApi.buy(assetPost.id, BigInt(amount * 1e8))
        if (res) message.success("success")
        else throw new Error("failed")
      }
    } catch (e: any) {
      console.log(e)
      message.error(e.message ?? JSON.stringify(e))
    } finally {
      getPrice()
      updateFunction?.()
    }
  }

  const sellAsset = async () => {
    if (amount * 1e8 > balance) return
    if (amount <= 0) return
    try {
      setOpen(false)
      message.loading("pending...")
      if ("id" in assetPost) {
        const res = await tradeApi.sell(assetPost.id, BigInt(amount * 1e8))
        if (res) message.success("success")
        else throw new Error("failed")
      }
    } catch (e: any) {
      console.log(e)
      message.error(e.message ?? e.toString())
    } finally {
      getPrice()
      updateFunction?.()
    }
  }

  return <div className={"post_trade_price"} onClick={e => e.stopPropagation()}>
    <span>
      {price === undefined ? "-/-" : (price / 1e8).toFixed(3) + " ICP / Cube"}
    </span>
    <span className={"button_wrap"}>
      <span style={{backgroundColor: "#B4F7B3"}} onClick={() => {
        setOpen(true)
        setType("buy")
      }}>Buy</span>
      <span style={{backgroundColor: "#FFC8C8"}} onClick={() => {
        setOpen(true)
        setType("sell")
      }}>Sell</span>
    </span>
    <Trade balance={type === "buy" ? undefined : balance / 1e8} icpAmount={icpAmount} amount={amount}
           setAmount={setAmount}
           api={type === "buy" ? buyAsset : sellAsset} type={type} setOpen={setOpen}
           open={open}/>
  </div>
})

const ImagePreview = ({src, imageCount}: { src: string, imageCount: number }) => {

  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    setIsFullScreen(true);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    setIsFullScreen(false);
  };

  return (
    <>
      <div className="image-container">
        <img
          src={src}
          alt=""
          onClick={handleImageClick}
          style={{width: imageCount === 1 ? 'auto' : '100%'}}
        />
      </div>

      {isFullScreen && (
        <div className="image-overlay" onClick={handleOverlayClick}>
          <img
            src={src}
            alt=""
            className="full-screen-image"
          />
        </div>
      )}
    </>
  );
};

const BottomButton = React.memo(({handleClick, hoverOne, setHoverOne, arg, post, like, showSending, isTrade}: {
  handleClick: Function,
  hoverOne: number,
  setHoverOne: Function,
  arg: { isLike: boolean, isRepost: boolean },
  post: postType | AssetPost,
  like: boolean,
  showSending: boolean, isTrade?: boolean
}) => {
  const {isAuth} = useAuth()
  const [copyShareLink, setCopyShareLink] = useState(false)
  const na = useNavigate()

  const copy = async () => {
    try {
      const newStr = post.post_id.replace(/#/g, '_');
      await navigator.clipboard.writeText(window.location.host + "/post/" + newStr);
      setCopyShareLink(true)
      setTimeout(() => setCopyShareLink(false), 1000)
    } catch (e) {
    }
  }

  const gotoAsset = () => {
    if ("id" in post)
      na("/asset/" + Number(post.id))
  }

  const handleHover = (index: number) => {
    if (isAuth)
      setHoverOne(index)
    else setHoverOne(-1)
  }

  return <div className={"post_bottom"}>

    <Tooltip title={!isAuth ? "please login first" : ""}>
       <span onClick={(e) => {
         if (!isAuth) return 0
         e.stopPropagation()
         handleClick(0)
       }}
             style={{color: arg.isLike || hoverOne === 0 ? "red" : "black", cursor: !isAuth ? "no-drop" : ""}}
             onMouseEnter={e => handleHover(0)}
             onMouseLeave={e => setHoverOne(-1)}>
           <Icon name={arg.isLike || hoverOne === 0 || like ? "like_click" : "like"}/>
         {like ? post.like.length + 1 : post.like.length}
      </span>
    </Tooltip>

    <Tooltip title={!isAuth ? "please login first" : ""}>

        <span onClick={(e) => {
          if (!isAuth) return 0
          e.stopPropagation()
          handleClick(1)
        }}
              style={{color: hoverOne === 1 ? "#1C9BEF" : "black", cursor: !isAuth ? "no-drop" : ""}}
              onMouseEnter={e => handleHover(1)}
              onMouseLeave={e => setHoverOne(-1)}>
           <Icon color={hoverOne === 1 ? "#1C9BEF" : "black"} name={"comment"}/>
          {post.comment.length}
          <span style={{
            display: showSending ? "block" : "none",
            background: "#D7E4FF",
            borderRadius: "2.1rem",
            fontFamily: "Fredoka , sans-serif",
            padding: "1rem 1.3rem"
          }}>Sending</span>
      </span>
    </Tooltip>

    {!isTrade && <Tooltip title={!isAuth ? "please login first" : ""}>
         <span onClick={(e) => {
           if (!isAuth) return 0
           e.stopPropagation()
           handleClick(2)
         }}
               style={{
                 color: arg.isRepost || hoverOne === 2 ? "rgb(0,186,124,0.6)" : "black",
                 cursor: !isAuth ? "no-drop" : ""
               }}
               onMouseEnter={() => handleHover(2)}
               onMouseLeave={e => setHoverOne(-1)}>
           <Icon color={arg.isRepost || hoverOne === 2 ? "rgb(0,186,124,0.6)" : "black"} name={"repost"}/>
           {post.repost.length}
      </span>
    </Tooltip>}
    <span onClick={(e) => {
      e.stopPropagation()
      handleClick(3)
    }}
          style={{
            background: hoverOne === 3 ? "#F0F4FF" : "",
            borderRadius: "50%",
            padding: "0.5rem 0.7rem"
          }}
          onMouseEnter={() => handleHover(3)}
          onMouseLeave={e => setHoverOne(-1)}>
           <Icon name={"heartbeat"}/>
      </span>
    <Tooltip title={copyShareLink ? "Copied" : "Copy Share Link"}>
      <span onClick={(e) => {
        e.stopPropagation()
        copy()
      }}
            style={{
              background: hoverOne === 4 ? "#F0F4FF" : "",
              borderRadius: "50%",
              padding: "0.5rem 0.7rem"
            }}
            onMouseEnter={() => handleHover(4)}
            onMouseLeave={e => setHoverOne(-1)}>
           <Icon name={"share"}/>
      </span>
    </Tooltip>
    <span onClick={(e) => {
      e.stopPropagation()
      isTrade ? gotoAsset() : handleClick(5)
    }}
          style={{
            background: hoverOne === 5 ? "#F0F4FF" : "",
            borderRadius: "50%",
            padding: "0.5rem 0.7rem"
          }}
          onMouseEnter={() => handleHover(5)}
          onMouseLeave={e => setHoverOne(-1)}>
           <Icon name={isTrade ? "trade_chart" : "grant"}/>
      </span>
  </div>
})

