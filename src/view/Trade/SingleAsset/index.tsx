import React, {Fragment, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Post as PostType} from "../../../declarations/feed/feed";
import Feed from "../../../actors/feed";
import {Principal} from "@dfinity/principal";
import {LikeList} from "../../../components/LikeList";
import {Profile} from "../../../declarations/user/user";
import {useSelectPostStore} from "../../../redux/features/SelectPost";
import {userApi} from "../../../actors/user";
import {Loading} from "../../../components/Loading";
import {Empty} from "antd";
import Icon from "../../../Icons/Icon";
import {Post} from "../../Main";
import {tradeApi} from "../../../actors/trade";
import "./index.scss"
import {Asset, TradeEvent} from "../../../declarations/trade";
import {AssetPost} from "../index";

export const SingleAsset = React.memo(() => {
  const {assetId} = useParams()
  const [post, setPost] = useState<AssetPost>()
  const [showLikeList, setShowLikeList] = useState(false)
  const [likeUsers, setLikeUsers] = useState<Profile[]>()
  const {post: selectPost} = useSelectPostStore()
  const [error, setError] = useState<boolean>(false)
  const [profile, setProfile] = useState<Profile>()
  const [asset, setAsset] = useState<Asset>()
  const [info, setInfo] = useState({
    postId: "",
    cid: "",
    userId: ""
  })

  useEffect(() => {
    const init = async () => {
      if (assetId === undefined) return
      try {
        const asset = await tradeApi.get_asset(BigInt(assetId))
        setAsset(asset)
        const postId = asset.post_id
        const slice = postId?.split("#")
        const [cid, userId] = slice
        setInfo({postId, cid, userId})
      } catch (e) {
        setError(true)
      }
    }
    init()
  }, [assetId]);

  const getPost = async () => {
    const {cid, postId, userId} = info
    if (!cid || !postId || !userId || error || !asset) return
    try {
      const p_id = Principal.from(cid)
      const api = new Feed(p_id)
      userApi.getProfile(Principal.from(userId)).then(res => {
        setProfile(res)
      })
      const res = await api.getPost(postId)
      if (res[0]) {
        const A = {...res[0], ...asset}
        setPost(A)
      } else throw new Error("post not found")
    } catch (e) {
      console.log(e)
      setError(true)
    }
  }


  useEffect(() => {
    getPost()
  }, [info]);

  return <>
    <LikeList style={{display: showLikeList ? "flex" : "none"}} backApi={() => {
      setShowLikeList(false)
      setLikeUsers(undefined)
    }}
              users={likeUsers}/>
    <div style={{display: showLikeList ? "none" : "flex"}} id={"content_main"}
         className={"main_wrap"}>
      <div className={"title"}>
          <span style={{cursor: "pointer", marginRight: "1rem"}} onClick={() => window.history.back()}>
          <Icon name={"back"}/>
      </span>
        Trade Post
      </div>
      {post ? <Post isTrade={true} setLikeUsers={setLikeUsers} profile={profile}
                    selectedID={selectPost ? selectPost.post_id : ""}
                    updateFunction={getPost}
                    post={post} setShowLikeList={setShowLikeList}/> :
        error ? <Empty style={{width: "100%"}}/> :
          <Loading isShow={true} style={{width: "100%"}}/>}
      <AssetInfo id={BigInt(0)}/>
    </div>
  </>
})


const AssetInfo = React.memo(({id}: { id: bigint }) => {
  const [clickOne, setClickOne] = useState<number>(0)
  const [recentTrade, setRecentTrade] = useState<TradeEvent[]>()
  const [profiles, setProfiles] = useState<Profile[]>()
  const [totalValue, setTotalValue] = useState<number>()
  const [supply, setSupply] = useState<number>()
  const [holders, setHolders] = useState<(Profile & { amount: bigint })[]>()


  useEffect(() => {
    const init = async () => {

      tradeApi.get_holders(id).then(e => {
        const ids = e.map(e => e[0])
        const amounts = e.map(e => e[1])
        userApi.batchGetProfile(ids).then(p => {
          const d = p.map((v, k) => {
            return {...v, amount: amounts[k]}
          })
          setHolders(d)
        })
      })

      tradeApi.get_pool_value(id).then(e => {
        setTotalValue(Number(e))
      })
      tradeApi.get_share_supply(id).then(e => {
        setSupply(Number(e))
      })
      const rt = await tradeApi.get_recent_trade(id)
      setRecentTrade(rt)
      const pids = rt.map(e => e.sender)
      const ps = await userApi.batchGetProfile(pids)
      setProfiles(ps)
    }
    init()
  }, []);

  return <div className={"asset_info"}>
    <div className={"asset_info_head"}>
      <span className={clickOne === 0 ? "active" : ""} onClick={() => setClickOne(0)}>Recent Trades</span>
      <span className={clickOne === 1 ? "active" : ""} onClick={() => setClickOne(1)}>Holders</span>
      <span>Overview</span>
    </div>
    <div className={"asset_info_body"}>
      <div className={"asset_info_body_left"}>
        {clickOne === 0 ? <RecentTrade recentTrade={recentTrade} profiles={profiles}/> : <Holders holders={holders}/>}
      </div>
      <div className={"asset_info_body_right"}>
        <div className={"item"}>
          <span>Total Value</span>
          <span>{totalValue !== undefined ? (totalValue / 1e8) : "-/-"} ICP</span>
        </div>
        <div className={"item"}>
          <span>Cubes Supply</span>
          <span>{supply !== undefined ? (supply / 1e8).toFixed(2) : "-/-"} Cubes</span>
        </div>
      </div>
    </div>
  </div>
})

const Holders = React.memo(({holders}: { holders?: (Profile & { amount: bigint })[] }) => {
  return <Fragment>
    {holders ? holders.map((v, k) => {
      return <div className={"item"} key={k}>
        <span>{v.handle}</span>
        <span/>
        <span>{(Number(v.amount) / 1e8).toFixed(2)} Cubes🧊</span>
      </div>
    }) : <Loading isShow={true} style={{width: "100%"}}/>}
  </Fragment>
})

const RecentTrade = React.memo(({recentTrade, profiles}: { recentTrade?: TradeEvent[], profiles?: Profile[] }) => {
  return <Fragment>
    {recentTrade ? recentTrade.map((v, k) => {
      return <div className={"item"} key={k}>
        <span>{profiles ? profiles[k].handle : "-/-"}</span>
        <span className={"buy"}>{Object.keys(v.trade_type)[0]}</span>
        <span>{(Number(v.token_amount) / 1e8).toFixed(2)} cube for {Number(v.icp_amount) / 1e8} ICP</span>
      </div>
    }) : <Loading isShow={true} style={{width: "100%"}}/>}
  </Fragment>
})
