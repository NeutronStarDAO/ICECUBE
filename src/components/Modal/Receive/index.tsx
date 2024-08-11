import "./index.scss"

import React from "react"
import {Modal} from "../index";
import Icon from "../../../Icons/Icon";

export const Receive = ({open, setOpen}: { open: boolean, setOpen: Function }) => {
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
        <div className={"address"}>
          0b07bdd4e1d5 ... d450992af
        </div>
      </div>
    </div>
  </Modal>
}
