/**
 * 执行n此cb，并且将结果返回成数组
 * @param {(i:number)=>any} cb 回调
 * @param {number} n 执行次数
 */
function repeat(cb, n) {
  const res = [];
  for (let i = 0; i < n; i++) {
    res.push(cb(i));
  }
  return res;
}
module.exports = { repeat };
