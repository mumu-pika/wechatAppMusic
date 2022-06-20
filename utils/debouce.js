// debouce.js (防抖总结整理)
/* 
  防抖

  当持续触发事件时，一定时间段内没有再触发事件，事件处理函数才会执行一次，如果设定的时间到来之前，又一次触发了事件，就重新开始延时。(简单理解：当用户频繁触发时间后，n秒内只执行一次。)

*/

/* 
 * @param Function fn 延时调用函数
 * @param Number delay 延迟多长时间
 * @param Boolean immediate 是否立即先执行一次
 * @return Function 延迟执行的方法
 * 
*/
// 防抖函数封装（debouce提供闭包环境）
export default function debouce(fn, delay = 200, immediate = true) {
  var timer = null
  return function (...args) {
    let flag = immediate && !timer //标识是否可以立即执行一次（注意！！这里需要timer为空，且immediate为true,才能立即执行一次）
    // 如果定时器timer不为null
    if (timer) {
      // 每次触发事件都先清除一次设定的定时器，因为定时器需要重新计时
      clearTimeout(timer)
    }
    // 如果可以立即执行一次
    if (flag) {
      fn.apply(this, args)
      // 重新设定一个新的定时器，延迟delay调用fn
      timer = setTimeout(() => {
        timer = null //重置timer
      }, delay)
    }
    else {
      // 重新设定一个新的定时器，延迟delay调用fn
      timer = setTimeout(() => {
        timer = null //调用fn后，重置timer
        fn.apply(this, args)
      }, delay)
    }
  }
}

// 这种方法我之前使用过，需要在回调函数中获取this并作为context形参传入
// 一种通过改变data中的状态来改变bindtap事件绑定的回调函数是否可触发，是变相的一种防抖，也可以实现功能，但不推荐这种写法
// export default function debouce(context,delay) {
//   var timer
//   var delay = delay || 500
//   // 这里的isClick关联着事件回调函数 bindtap="{{!isClick ? 'handleSwitch': ''}}
//   context.setData({ isClick: true })
//   if(timer) clearTimeout(timer)
//   // 设定delay.定时
//   timer = setTimeout(() => {
//     context.setData({ isClick: false })
//   }, delay)
// }





