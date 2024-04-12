// pages/index/index.ts
import { post, upload } from "../../utils/http"
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    headUrl: '',
    userName: '',
    usagesRoom: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(param: any) {
    console.log(param.roomId)
    console.log(param.scene)
    if (param.roomId || param.scene) {
      var roomId = param.roomId ? param.roomId : param.scene;
      // todo 如果之前还开得有房间,那么让用户选择是否要关闭之前的房间
      post("getRoomInfo").then((roomInfo: any) => {
        console.log('roomInfo')
        console.log(roomInfo)
        if(null == roomInfo){
          post("joinRoom", { roomId: roomId }).then((roomRes: any) => {
            wx.navigateTo({
              url: '/pages/room/room?roomId=' + roomRes.id
            })
          })
          return;
        }
        this.setData({
          usagesRoom: roomInfo
        })
        // 之前开了房间
        if(this.data.usagesRoom){
          console.log("usagesRoom")
          console.log(this.data.usagesRoom)
          // 如果是重复点击邀请的连接
          if(this.data.usagesRoom.id == roomId){
            wx.navigateTo({
              url: '/pages/room/room?roomId=' + roomId
            })
          }
          var roomIdTmp = this.data.usagesRoom.id
          Dialog.confirm({
            title: '退出老房间?',
            message: '即将进入新房间,老房间将自动退出,请确认',
          })
            .then(() => {
              // 退出房间,然后加入
              post('exitRoom', { roomId: roomIdTmp }).then(() => {
                post("joinRoom", { roomId: roomId }).then((roomRes: any) => {
                  wx.navigateTo({
                    url: '/pages/room/room?roomId=' + roomRes.id
                  })
                })
              });
            })
            .catch(() => {
              // 不退出,那么直接停留在当前页面

            });
        }
      });
      
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  openCamera: function() {
    // 只允许从相机扫码
    wx.scanCode({
      onlyFromCamera: true,
      success (res) {
        console.log(res)
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    post("getUserInfo").then((res: any) => {
      console.log('获取到的userInfo:')
      console.log(res)
      post("getRoomInfo").then((roomInfo: any) => {
        this.setData({
          headUrl: res.avatarUrl,
          userName: res.userName,
          usagesRoom: roomInfo
        })
      });
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '很哇塞的打牌记账程序～',
      path: '/pages/index/index',
      imageUrl: 'https://doraemon-website.oss-cn-shanghai.aliyuncs.com/ramdomAvatar/image%20%283%29.png',
    }
  }

  , setHead(e: Object) {
    console.log(e)
    upload('setUserAvatar', e.detail.avatarUrl, 'userAvatar').then(() => {
      this.setData({
        headUrl: e.detail.avatarUrl
      })
    })
  },

  setName(e: Object) {
    console.log(e)
    console.log(this.data.userName)
    if(e.detail.value==null || e.detail.value==''){
      Toast('无法获取用户昵称');
      return;
    }
    post('setUserName', { userName: e.detail.value }, true);
    this.setData({
      userName: e.detail.value
    })
  },

  putRoom() {
    if (this.data.userName) {
      var room: any = this.data.usagesRoom;
      if (room) {
        wx.navigateTo({
          url: '/pages/room/room?roomId=' + room.id
        })
      } else {
        post("buildRoom", {}, true).then((res: any) => {
          console.log(res)
          wx.navigateTo({
            url: '/pages/room/room?roomId=' + res.id
          })
        });
      }
    } else {
      Toast('请填写用户名后再创建房间');
    }
  },

  toHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    })
  }
})