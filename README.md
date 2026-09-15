# QLCS 青龙脚本库

#### 订阅仓库

```
ql repo https://github.com/Hosiang1026/QLCS.git "task/" "app.js|ql_table_task.js|ql_huzhou_water_task.js" "functions/|db/|utils/|sh/|node_modules/" "master"
```

#### 安装依赖

```
cd /ql/data/repo/Hosiang1026_QLCS_master && npm run deps
```

电信任务另装 Python 依赖：

```
cd /ql/data/repo/Hosiang1026_QLCS_master && pip3 install -r py/requirements.txt
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

##### v2.0.0 (2026-09-15)

- `npm run deps` 仅安装 Node 依赖，移除 `sh/install_deps.sh`
- 电信任务需单独 `pip3 install -r py/requirements.txt`（含 `paho-mqtt`）
- 实况天气仅下雨或预警时推送
- 节日提醒仅证件临期或节日临近时推送
- 油价：浙江 95 号未变价且非周末跳过推送
- 电信：登录失败次数容错；欠费时仍推送
- 依赖增加 Node `mqtt`

##### v1.0.0 (2026-09-15)

- 新增 `ql_huzhou_water_task.js` 湖州水费查询推送
- 新增 `ql_telecom_task.js` 电信套餐用量监控
- 国家电网支持 `WSGW_ACCOUNTS` 多账号循环执行
- 节日提醒 cron 调整为 `0 0 * * *`
- 移除已失效的 `ql_next_weather_task.js` 未来预报任务
- 配置统一至 `sh/exports.sh`，任务启动校验环境变量
