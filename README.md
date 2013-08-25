# youmeb-injector

這個 module 可以單獨與 express 使用，也會內建於 youmeb.js，youmeb.js 中會再做一些包裝。

### 要處理的事情

1. 跑指定目錄下的的所有目錄，檢查他們的 package.json
2. 檢查有沒有版本號衝突，或相依 package 沒裝到
3. 初始化所有 package
4. require package 的方法

### 不處理的事情

1. package 安裝（ypm - youmeb package manager）
2. 相依 package 安裝（ymp - youmeb package manager）
