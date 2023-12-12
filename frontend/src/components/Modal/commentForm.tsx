import React from 'react';
import {
  Form,
} from 'antd';
import {useAuth} from "../../utils/useAuth";
import Feed from "../../actors/feed";
import {EditModal} from "./EditModal";

export function CommentForm(props: { setOpen: Function }) {
  const {userFeedCai} = useAuth()
  const [form] = Form.useForm();

  const onFinish = async (values: { title: string, content: string }) => {
    if (!userFeedCai) return
    const feedApi = new Feed(userFeedCai)
    await feedApi.createComment(values.title, values.content)
    await feedApi.getAllPost()
    form.resetFields()
    props.setOpen(false)
  };

  return (
    <EditModal form={form} onFinish={onFinish}/>
  );
};