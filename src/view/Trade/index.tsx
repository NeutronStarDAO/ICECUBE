import "./index.scss"
import React, {useEffect, useRef, useState} from 'react';
import {Post as postType} from "../../declarations/feed/feed";
import {Empty} from "antd";
import {userApi} from "../../actors/user";
import {Profile} from "../../declarations/user/user";
import {useSelectPostStore} from "../../redux/features/SelectPost";
import {Loading} from "../../components/Loading";
import {LikeList} from "../../components/LikeList";
import {Post} from "../Main";
import {tradeApi} from "../../actors/trade";
import {Asset} from "../../declarations/trade";
import {useAuth} from "../../utils/useAuth";
import Feed from "../../actors/feed";
import {useNavigate} from "react-router-dom";

const pageCount = 5

export type AssetPost = postType & Asset
export const Trade = () => {
  const [data, setData] = useState<AssetPost[]>()
  const [page, setPage] = useState(0);
  const [isEnd, setIsEnd] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showLikeList, setShowLikeList] = useState(false)
  const [likeUsers, setLikeUsers] = useState<Profile[]>()
  const {post: selectPost} = useSelectPostStore()
  const {userFeedCai, isAuth} = useAuth()
  const loader = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    !isAuth && navigate("/explore")
  }, [isAuth, navigate])

  // const getData = React.useCallback(async () => {
  //   if (!userFeedCai) return setData(undefined)
  //   const assets = await tradeApi.get_asset_entries_by_len(page * pageCount, pageCount)
  //   const postIds = assets.map(e => e.post_id)
  //   const api = new Feed(userFeedCai)
  //   const posts = await api.batch_get_post(postIds)
  //   const res = posts.map((v, k) => {
  //     return {...v, ...assets[k]}
  //   })
  //   if (page === 0) {
  //     if (res.length < pageCount) setIsEnd(true)
  //     return setData(res)
  //   }
  //   if (res.length < pageCount || res.length === 0) setIsEnd(true)
  //   const newArr = [...(data ?? []), ...res]
  //   setData(newArr);
  // }, [page, userFeedCai])

  const getData = async () => {
    if (!userFeedCai) return setData(undefined)
    const res = await tradeApi.get_asset_entires_sorted_by_vol()
    const assets = res.map(e => e[0])
    const postIds = assets.map(e => e.post_id)
    const api = new Feed(userFeedCai)
    const posts = await api.batch_get_post(postIds)
    const data = posts.map((v, k) => {
      return {...v, ...assets[k]}
    })
    setData(data)
  }


  useEffect(() => {
    data && userApi.batchGetProfile(data.map(v => v.user)).then(e => setProfiles(e))
  }, [data]);

  useEffect(() => {
    getData()
  }, [getData]);


  // useEffect(() => {
  //   const ob = new IntersectionObserver((entries) => {
  //     if (entries[0].isIntersecting) {
  //       setPage((prev) => prev + 1)
  //     }
  //   }, {threshold: 0})
  //
  //   loader.current && ob.observe(loader.current)
  //
  //   return () => {
  //     loader.current && ob.unobserve(loader.current)
  //   }
  // }, [loader.current])


  return <>
    <LikeList style={{display: showLikeList ? "flex" : "none"}} backApi={() => {
      setShowLikeList(false)
      setLikeUsers(undefined)
    }}
              users={likeUsers}/>
    <div style={{display: showLikeList ? "none" : "flex"}} id={"content_main"}
         className={"main_wrap scroll_main"}>
      <div className={"title"}>Trade</div>
      {data ? data.length === 0 ? <Empty style={{width: "100%"}}/>
        : data.map((v, k) => {
          return <Post notShowDropdown={true} isTrade={true} setLikeUsers={setLikeUsers} key={k} profile={profiles[k]}
                       selectedID={selectPost ? selectPost.post_id : ""}
                       updateFunction={getData}
                       post={v} setShowLikeList={setShowLikeList}/>
        }) : <Loading isShow={true} style={{width: "100%"}}/>}
      {/*<div ref={loader} style={{width: "100%", display: data && !isEnd ? "" : "none"}}>*/}
      {/*  <Loading isShow={true} style={{width: "100%"}}/>*/}
      {/*</div>*/}
    </div>
  </>
}

