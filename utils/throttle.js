// throttle.js (节流总结整理)
/* 
  节流

  函数节流会预定一个自动执行时间，到时自动执行一次。（简单理解:在固定的时间内触发事件，每隔n秒触发一次。）
  固定周期内，只执行一次动作，若有新事件触发，不执行。周期结束后，又有事件触发，开始新的周期。

  此时直到这里，如果用户不断的调用fn，这时延迟处理函数一次都不会执行。故需要一个时间段，在这个时间段里至少触发一次。

  当用户触发fn的时候应该在某段时间内至少触发一次，既然是在某段时间内，那么这个判断条件就可以取当前的时间毫秒数，每次函数调用把当前的时间和上一次调用时间相减，然后判断差值如果大于某段时间就直接触发，否则还是走timeout 的延迟逻辑。

  注意！setTimeout 函数返回值应该保存在一个相对全局变量里面，否则每次 resize 的时候都会产生一个新的计时器，这样就达不到我们发的效果了。

  为了达到上面的要求，我们用一个闭包函数（throttle节流）把 timer 放在内部并且返回延时处理函数，这样以来 timer 变量对外是不可见的，但是内部延时函数触发时还可以访问到 timer 变量。
*/

/* 
 * @param Function fn 延时调用函数
 * @param Number wait 延迟多长时间
 * @param Number atLeast 至少多长时间触发一次
 * @return Function 延迟执行的方法
*/
// 节流函数封装（throttle提供闭包环境）
// 这里我标记delay为wait，是为了加强语义，表明节流的delay和防抖的delay不同含义。
export default function throttle(fn, wait = 2000, atLeast = 0) {
  // Date.now()返回自1970年1月1日00:00:00 UTC以来经过的毫秒数
  var timer = null //设定定时器
  var previousTime = null //上一次执行的记录(时间点timePoint)
  // 返回节流函数
  return function (...args) {
    var currentTime = Date.now() //记录当前的事件点
    // 如果该函数第一次调用，则设置把当前时间设置给previousTime
    if (!previousTime) previousTime = currentTime 
    // 如果当前时间与上一次调用该函数的时间的时间差大于设定的至少多久触发一次的时间值，执行一次触发
    if (atLeast && (currentTime - previousTime) > atLeast){
      clearTimeout(timer)
      fn.apply(this, args) //调用真正需要节流的函数
      previousTime = currentTime //重置上一次的时间点为当前时间
    }
    // 如果当前时间距离上一次调用该函数的时间相近或是新的一轮
    else{ 
      clearTimeout(timer)
      timer = setTimeout(() => {
        fn.apply(this, args)
        previousTime = null //重置为空，准备下一轮
      }, wait)
    }
  }
}






