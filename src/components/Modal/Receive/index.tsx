import "./index.scss"

import React, {useEffect} from "react"
import {Modal} from "../index";
import Icon from "../../../Icons/Icon";
import {shortenString} from "../../Sider";
import {Tooltip} from "antd";

export const Receive = ({open, setOpen, address}: { open: boolean, setOpen: Function, address: string }) => {
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true)
    } catch (e) {
    }
  }

  useEffect(() => {
    setCopied(false)
  }, [open]);
  return <Modal setOpen={setOpen} open={open}>
    <div className={"receive_modal"}>
      <div className={"title"}>
        <Icon name={"right"}/>
        Receive
      </div>

      <div className={"token"}>
        ICP
      </div>

      <div className={"wallet"}>
        Wallet Address
        <Tooltip title={copied ? "copied!" : "copy"}>
          <div className={"address"} onClick={copy}>
            {shortenString(address, 40)}
            <Icon name={"copy"}/>
          </div>
        </Tooltip>
      </div>

      <div className={"done_button"}>
        Done
      </div>
    </div>
  </Modal>
}