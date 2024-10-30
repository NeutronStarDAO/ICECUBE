import React, {Fragment, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import Feed from "../../../actors/feed";
import {Principal} from "@dfinity/principal";
import {LikeList} from "../../../components/LikeList";
import {Profile} from "../../../declarations/user/user";
import {useSelectPostStore} from "../../../redux/features/SelectPost";
import {userApi} from "../../../actors/user";
import {useAuth} from "../../../utils/useAuth";
import {Loading} from "../../../components/Loading";
import {Empty} from "antd";
import Icon from "../../../Icons/Icon";
import {Post} from "../../Main";
import {tradeApi} from "../../../actors/trade";
import "./index.scss"
import {Asset, TradeEvent} from "../../../declarations/trade";
import {AssetPost} from "../index";

export const SingleAsset = React.memo(() => {
  const {isDark} = useAuth()
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
  const [recentTrade, setRecentTrade] = useState<TradeEvent[]>()
  const [profiles, setProfiles] = useState<Profile[]>()
  const [totalValue, setTotalValue] = useState<number>()
  const [supply, setSupply] = useState<number>()
  const [holders, setHolders] = useState<(Profile & { amount: bigint })[]>()

  const init = async () => {
    if (assetId === undefined) {
      setError(true)
      return
    }
    if (isNaN(+assetId)) {
      setError(true)
      return
    }
    const id = BigInt(+assetId)
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
    tradeApi.icrc1_total_supply(id).then(e => {
      setSupply(Number(e))
    })
    const rt = await tradeApi.get_recent_trade(id)
    setRecentTrade(rt)
    const pids = rt.map(e => e.sender)
    const ps = await userApi.batchGetProfile(pids)
    setProfiles(ps)
  }

  useEffect(() => {
    init()
  }, []);


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
      <div className={`title ${isDark ? "dark_title" : ""}`}>
          <span style={{cursor: "pointer", marginRight: "1rem"}} onClick={() => window.history.back()}>
          <Icon name={"back"}/>
      </span>
        Trade Post
      </div>
      {post ? <Post isTrade={true} setLikeUsers={setLikeUsers} profile={profile}
                    selectedID={selectPost ? selectPost.post_id : ""}
                    updateFunction={() => {
                      init()
                      getPost()
                    }}
                    post={post} setShowLikeList={setShowLikeList}/> :
        error ? <Empty style={{width: "100%"}}/> :
          <Loading isShow={true} style={{width: "100%"}}/>}
      {!error && <AssetInfo holders={holders} profiles={profiles} totalValue={totalValue} recentTrade={recentTrade}
                            supply={supply}/>}
    </div>
  </>
})


const AssetInfo = React.memo((props: {
  recentTrade?: TradeEvent[],
  profiles?: Profile[], holders?: (Profile & { amount: bigint })[], totalValue?: number, supply?: number
}) => {
  const [clickOne, setClickOne] = useState<number>(0)
  const {isDark} = useAuth()
  const {recentTrade, profiles, holders, totalValue, supply} = props

  return <div className={`asset_info ${isDark ? "dark_asset_info" : ""}`}>
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
      const type = Object.keys(v.trade_type)[0]
      return <div className={"item"} key={k}>
        <span>{profiles && profiles[k] ? profiles[k].handle : "-/-"}</span>
        <span className={type}>{Object.keys(v.trade_type)[0]}</span>
        <span>{(Number(v.token_amount) / 1e8).toFixed(2)} cube for {Number(v.icp_amount) / 1e8} ICP</span>
      </div>
    }) : <Loading isShow={true} style={{width: "100%"}}/>}
  </Fragment>
})
