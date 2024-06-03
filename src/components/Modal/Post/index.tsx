import "./index.scss"
import {Modal} from "../index";
import React, {useEffect, useState} from "react";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import Icon from "../../../Icons/Icon";
import {FileRejection, useDropzone} from "react-dropzone";
import {aApi} from "../../../actors/photo_storage";
import {useAuth} from "../../../utils/useAuth";
import Feed from "../../../actors/feed";
import {useProfileStore} from "../../../redux";
import {shortenString} from "../../Sider";
import {notification} from "antd";
import {CheckOutlined, CloseOutlined, LoadingOutlined} from "@ant-design/icons";


export const PostModal = ({open, setOpen}: { open: boolean, setOpen: Function }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [text, setText] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const profile = useProfileStore()
  const {userFeedCai} = useAuth()
  const [api, contextHolder] = notification.useNotification();

  const updateData = async () => {
    if (!userFeedCai) return 0
    const feedApi = new Feed(userFeedCai)
    await Promise.all([feedApi.getAllPost(), feedApi.getLatestFeed(20)])
  }

  const send = async () => {
    if (!userFeedCai) return 0
    console.log(text)
    console.log(files)
    api.info({
      message: 'Create Post ing ...',
      key: 'createPost',
      duration: null,
      description: '',
      icon: <LoadingOutlined/>
    });
    try {
      setOpen(false)
      const urls = await aApi.upload_photo(files)
      const feedApi = new Feed(userFeedCai)
      await feedApi.createPost(text, urls)
      api.success({
        message: 'Create Post Successful !',
        key: 'createPost',
        description: '',
        icon: <CheckOutlined/>
      })
      updateData()
    } catch (e) {
      api.error({
        message: 'Create Post failed !',
        key: 'createPost',
        description: '',
        icon: <CloseOutlined/>
      })
    }
  }

  return <>
    {contextHolder}

    <Modal setOpen={setOpen} open={open} component={<div className={"post_modal"}>
      <div className={"post_head"}>
        <div style={{display: "flex", alignItems: "center"}}>
          <img style={{borderRadius: "50%"}} src={profile?.avatar_url ? profile.avatar_url : "./img_5.png"} alt=""/>
          <div style={{display: "flex", alignItems: "start", flexDirection: "column", justifyContent: "center"}}>
            <div className={"name"}>{profile?.name}</div>
            <div className={"id"}>{shortenString(profile.id ? profile.id.toString() : "xxxx", 10)}</div>
          </div>
        </div>
        <div style={{cursor: "pointer"}} onClick={() => setOpen(false)}>❌</div>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={"What’s happening?"} name="" id=""
                cols={30} rows={10}/>
      <div className={"post_foot"}>
        <SelectPhoto setFiles={setFiles}/>
        <div className={"smile"} onClick={() => setIsVisible(!isVisible)}>
          <Icon name={"smile"}/>
        </div>
        <div className={"picker"} style={{display: isVisible ? "block" : "none"}}>
          <Picker onClickOutside={() => {
            if (isVisible) setIsVisible(false)
          }} previewPosition="none" date={data} onEmojiSelect={(e: any) => setText(text + e.native)}/>
        </div>
      </div>
      <div className={"button_wrap"}>
        <div className={"button"} onClick={send}>Send</div>
      </div>

    </div>}/>
  </>
}

export const maxSize = 2 * 1024 * 1024//2MB
const SelectPhoto = ({setFiles}: { setFiles: Function }) => {

  const onDrop = React.useCallback((files: File[]) => {
    // const new_files: File[] = []
    // files.forEach((v, k) => {
    //   if (v.size < maxSize) new_files.push(v)
    // })
    setFiles(files)
  }, [])

  const {getRootProps, getInputProps} = useDropzone({
    onDrop, multiple: true, accept: {
      'image/jpeg': [],
      'image/png': []
    }, maxSize
  })

  return <div style={{height: "2.9rem"}}>
    <div{...getRootProps()}>
      <input {...getInputProps()} />
      <Icon name={"picture"}/>
    </div>
  </div>
}
