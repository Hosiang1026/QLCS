# QLCS 青龙脚本库

#### 订阅仓库

```
ql repo https://github.com/Hosiang1026/QLCS.git "task/" "app.js|ql_table_task.js|ql_huzhou_water_task.js" "functions/|db/|utils/|sh/|node_modules/" "master"
```

#### 安装依赖

```
cd /ql/data/repo/Hosiang1026_QLCS_master && npm run deps
```

或：

```
cd /ql/data/repo/Hosiang1026_QLCS_master && bash sh/install_deps.sh
```

注： 配置文件，参考/sh/exports.sh


#### 任务列表

| 脚本名称 | 作用 | 执行规则 | 是否可用 |
| --- | --- | --- | --- |
| `task/ql_weather_task.js` | 实况天气 | `5 7 * * *` | ✓ |
| `task/ql_shenghuozs_task.js` | 生活指数 | `18 7 * * *` | ✓ |
| `task/ql_daily_task.js` | 节日提醒 | `0 0 * * *` | ✓ |
| `task/ql_state_grid_task.js` | 国家电网 | `30 8 * * *` | ✓ |
| `task/ql_gasoline_task.js` | 汽油价格 | `25 6 * * *` | ✓ |
| `task/ql_lottery_task.js` | 福利彩票 | `35 21 * * *` | ✓ |
| `task/ql_table_task.js` | 网课提醒 | `40 7 * * 1-5` | ✓ |
| `task/ql_gold_task.js` | 金银价格 | `11 10 * * *` | ✓ |
| `task/ql_telecom_task.js` | 电信套餐 | `0 20 * * *` | ✓ |
| `task/ql_huzhou_water_task.js` | 湖州水费 | `0 9 * * *` | ✓ |


#### 更新日志

##### v1.0.0 (2026-09-15)

- 新增 `ql_huzhou_water_task.js` 湖州水费查询推送
- 新增 `ql_telecom_task.js` 电信套餐用量监控
- 国家电网支持 `WSGW_ACCOUNTS` 多账号循环执行
- 节日提醒 cron 调整为 `0 0 * * *`
- 移除已失效的 `ql_next_weather_task.js` 未来预报任务
- 配置统一至 `sh/exports.sh`，任务启动校验环境变量
