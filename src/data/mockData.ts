import {
  User,
  Device,
  ConfigTemplate,
  Firmware,
  FirmwareUpdateLog,
  EventLog,
  AuditLog,
  DeviceGroup,
  RolePermission,
} from "../types";

export const INITIAL_USERS: User[] = [
  {
    id: "usr-1",
    username: "admin",
    name: "系统超级管理员",
    role: "SUPER_ADMIN",
    email: "admin@netconfig.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    status: "active",
    lastLogin: "2026-08-12 09:30:12",
    ip: "192.168.1.100",
  },
  {
    id: "usr-2",
    username: "engineer_zhang",
    name: "张明 (资深网络工程师)",
    role: "NETWORK_ENGINEER",
    email: "zhang.ming@netconfig.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    status: "active",
    lastLogin: "2026-08-12 08:45:20",
    ip: "192.168.1.105",
  },
  {
    id: "usr-3",
    username: "auditor_li",
    name: "李华 (安全审计员)",
    role: "AUDITOR",
    email: "li.hua@netconfig.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    status: "active",
    lastLogin: "2026-08-11 16:20:05",
    ip: "192.168.1.112",
  },
  {
    id: "usr-4",
    username: "guest_user",
    name: "访客观察员",
    role: "GUEST",
    email: "guest@netconfig.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    status: "active",
    lastLogin: "2026-08-10 14:10:00",
    ip: "192.168.1.200",
  },
];

export const INITIAL_GROUPS: DeviceGroup[] = [
  { id: "grp-1", name: "核心数据中心 (DC-Core)", description: "主要机房核心路由器与骨干交换机", deviceCount: 4, color: "blue" },
  { id: "grp-2", name: "总部汇聚网络 (HQ-Agg)", description: "总部大楼各楼层汇聚设备", deviceCount: 6, color: "emerald" },
  { id: "grp-3", name: "分支机构接入 (Branch-Access)", description: "全国各地分支机构接入网关与AP", deviceCount: 8, color: "purple" },
  { id: "grp-4", name: "安全防护边界 (Sec-Perimeter)", description: "边界防火墙、IPS与负载均衡器", deviceCount: 3, color: "amber" },
];

export const INITIAL_DEVICES: Device[] = [
  {
    id: "DEV-1001",
    name: "Core-Router-01",
    type: "Router",
    vendor: "Huawei",
    model: "NetEngine 8000 M14",
    ip: "10.0.0.1",
    mac: "70:7B:E8:11:22:33",
    location: "北京数据中心-101机架",
    status: "online",
    group: "核心数据中心 (DC-Core)",
    firmwareVersion: "V800R021C00SPC100",
    cpuUsage: 24,
    memoryUsage: 42,
    uptime: "128天 14小时",
    configStatus: "synced",
    lastSyncTime: "2026-08-12 09:15:00",
    portsCount: 24,
    activePorts: 18,
    ports: [
      { id: "p1", name: "100GE0/1/0", speed: "100Gbps", status: "up", trafficRx: "42.5 Gbps", trafficTx: "38.1 Gbps" },
      { id: "p2", name: "100GE0/1/1", speed: "100Gbps", status: "up", trafficRx: "15.2 Gbps", trafficTx: "12.8 Gbps" },
      { id: "p3", name: "10GE0/2/0", speed: "10Gbps", status: "up", vlan: 100, trafficRx: "8.4 Gbps", trafficTx: "7.9 Gbps" },
      { id: "p4", name: "10GE0/2/1", speed: "10Gbps", status: "down", vlan: 200, trafficRx: "0 Mbps", trafficTx: "0 Mbps" },
    ],
  },
  {
    id: "DEV-1002",
    name: "HQ-Switch-Core-A",
    type: "Switch",
    vendor: "Cisco",
    model: "Catalyst 9500-48Y4C",
    ip: "10.0.1.10",
    mac: "00:2A:6A:88:99:AA",
    location: "总部大楼5F-IT主机房",
    status: "online",
    group: "总部汇聚网络 (HQ-Agg)",
    firmwareVersion: "IOS-XE 17.09.04a",
    cpuUsage: 18,
    memoryUsage: 35,
    uptime: "89天 06小时",
    configStatus: "synced",
    lastSyncTime: "2026-08-12 08:30:00",
    portsCount: 48,
    activePorts: 36,
    ports: [
      { id: "p1", name: "TwentyFiveGigE1/0/1", speed: "25Gbps", status: "up", vlan: 10, trafficRx: "2.1 Gbps", trafficTx: "1.8 Gbps" },
      { id: "p2", name: "TwentyFiveGigE1/0/2", speed: "25Gbps", status: "up", vlan: 20, trafficRx: "3.4 Gbps", trafficTx: "2.9 Gbps" },
    ],
  },
  {
    id: "DEV-1003",
    name: "Border-FW-Master",
    type: "Firewall",
    vendor: "Huawei",
    model: "USG6680E-AC",
    ip: "10.0.0.254",
    mac: "E8:9D:87:CC:DD:EE",
    location: "北京数据中心-边界安全柜",
    status: "warning",
    group: "安全防护边界 (Sec-Perimeter)",
    firmwareVersion: "V600R007C20SPC300",
    cpuUsage: 78,
    memoryUsage: 82,
    uptime: "45天 11小时",
    configStatus: "pending",
    lastSyncTime: "2026-08-11 23:00:00",
    portsCount: 16,
    activePorts: 12,
  },
  {
    id: "DEV-1004",
    name: "Branch-GW-Shanghai",
    type: "Gateway",
    vendor: "H3C",
    model: "MSR 3610-X1",
    ip: "10.2.0.1",
    mac: "58:69:6C:11:22:33",
    location: "上海分公司-2F网络间",
    status: "online",
    group: "分支机构接入 (Branch-Access)",
    firmwareVersion: "Comware v7.1.064",
    cpuUsage: 12,
    memoryUsage: 28,
    uptime: "210天 03小时",
    configStatus: "synced",
    lastSyncTime: "2026-08-12 07:00:00",
    portsCount: 12,
    activePorts: 8,
  },
  {
    id: "DEV-1005",
    name: "HQ-WLAN-AC01",
    type: "Wireless_AP",
    vendor: "H3C",
    model: "WX3510H-PWR",
    ip: "10.0.2.1",
    mac: "58:69:6C:44:55:66",
    location: "总部大楼3F-无线控制机柜",
    status: "fault",
    group: "总部汇聚网络 (HQ-Agg)",
    firmwareVersion: "Comware v7.1.050",
    cpuUsage: 96,
    memoryUsage: 94,
    uptime: "2天 01小时",
    configStatus: "failed",
    lastSyncTime: "2026-08-12 01:20:00",
    portsCount: 8,
    activePorts: 4,
  },
  {
    id: "DEV-1006",
    name: "DC-LoadBalancer-Primary",
    type: "Load_Balancer",
    vendor: "F5",
    model: "BIG-IP i5800",
    ip: "10.0.0.50",
    mac: "00:01:D7:99:88:77",
    location: "北京数据中心-204机架",
    status: "online",
    group: "安全防护边界 (Sec-Perimeter)",
    firmwareVersion: "BIG-IP 16.1.3",
    cpuUsage: 31,
    memoryUsage: 54,
    uptime: "310天 19小时",
    configStatus: "synced",
    lastSyncTime: "2026-08-12 09:00:00",
    portsCount: 16,
    activePorts: 14,
  },
  {
    id: "DEV-1007",
    name: "Branch-GW-Shenzhen",
    type: "Gateway",
    vendor: "Ruijie",
    model: "RSR20-X-28",
    ip: "10.3.0.1",
    mac: "00:1A:A9:33:44:55",
    location: "深圳分公司-弱电房",
    status: "offline",
    group: "分支机构接入 (Branch-Access)",
    firmwareVersion: "RGOS 11.4(1)B1",
    cpuUsage: 0,
    memoryUsage: 0,
    uptime: "已离线",
    configStatus: "failed",
    lastSyncTime: "2026-08-10 18:00:00",
    portsCount: 8,
    activePorts: 0,
  },
];

export const INITIAL_TEMPLATES: ConfigTemplate[] = [
  {
    id: "TMPL-101",
    name: "华为路由器标准OSPF与BGP基础配置",
    vendor: "Huawei",
    deviceType: "Router",
    description: "适用于华为V8R21版本核心路由器的基础网络协议与安全策略模板",
    createdDate: "2026-05-10",
    updatedDate: "2026-08-01",
    status: "active",
    version: "v2.1",
    author: "张明",
    variables: ["ROUTER_ID", "OSPF_AREA", "BGP_AS", "MGMT_IP", "SUBNET_MASK"],
    commands: `# System Base Setup
sysname {{ROUTER_ID}}
header shell information "Authorized Personnel Only!"

# Interface GigabitEthernet
interface GigabitEthernet0/0/0
 ip address {{MGMT_IP}} {{SUBNET_MASK}}
 undo shutdown
 quit

# OSPF Configuration
ospf 1 router-id {{MGMT_IP}}
 area {{OSPF_AREA}}
  network {{MGMT_IP}} 0.0.0.255
 quit
quit

# BGP Configuration
bgp {{BGP_AS}}
 router-id {{MGMT_IP}}
 peer 10.0.0.2 as-number {{BGP_AS}}
 ipv4-family unicast
  undo synchronization
 quit
quit

# SSH & AAA Security
aaa
 local-user admin password irreversible-cipher Admin@2026!
 local-user admin service-type ssh http
 local-user admin privilege level 15
quit
stelnet server enable`,
  },
  {
    id: "TMPL-102",
    name: "思科Cat9500核心交换机VLAN与Trunk模板",
    vendor: "Cisco",
    deviceType: "Switch",
    description: "自动创建企业内部VLAN、划分接口802.1Q Trunk及生成树STP Mode",
    createdDate: "2026-06-15",
    updatedDate: "2026-07-20",
    status: "active",
    version: "v1.4",
    author: "系统管理员",
    variables: ["VLAN_ID", "VLAN_NAME", "TRUNK_PORT", "STP_PRIORITY"],
    commands: `! Cisco Catalyst Core Switch Template
hostname HQ-CORE-SW
spanning-tree mode rapid-pvst
spanning-tree vlan 1-4094 priority {{STP_PRIORITY}}

! Create VLAN
vlan {{VLAN_ID}}
 name {{VLAN_NAME}}
exit

! Configure Trunk Interface
interface {{TRUNK_PORT}}
 description UPLINK-TO-DISTRIBUTION
 switchport mode trunk
 switchport trunk allowed vlan add {{VLAN_ID}}
 switchport trunk encapsulation dot1q
 no shutdown
exit

! Enable SSH v2
ip domain-name netconfig.com
crypto key generate rsa modulus 2048
line vty 0 15
 transport input ssh
 login local
exit`,
  },
  {
    id: "TMPL-103",
    name: "华三FW安全区域与NAT策略模板",
    vendor: "H3C",
    deviceType: "Firewall",
    description: "针对H3C防火墙配置Trust/Untrust区域安全策略及源地址SNAT规则",
    createdDate: "2026-07-01",
    updatedDate: "2026-08-05",
    status: "active",
    version: "v1.0",
    author: "李华",
    variables: ["INSIDE_SUBNET", "OUTSIDE_IP", "NAT_POOL_START", "NAT_POOL_END"],
    commands: `# H3C Firewall Security Policy & NAT Template
security-zone name Trust
 import interface GigabitEthernet1/0/1
quit

security-zone name Untrust
 import interface GigabitEthernet1/0/2
quit

# Security Policy
security-policy ip
 rule 0 name Allow_Trust_To_Untrust
  source-zone Trust
  destination-zone Untrust
  source-ip-host {{INSIDE_SUBNET}}
  action pass
quit

# Address Group & NAT Policy
address-group 1
 address 0 {{NAT_POOL_START}} {{NAT_POOL_END}}
quit

interface GigabitEthernet1/0/2
 ip address {{OUTSIDE_IP}} 255.255.255.0
 nat outbound 2000 group 1
quit`,
  },
];

export const INITIAL_FIRMWARES: Firmware[] = [
  {
    id: "FW-HW-8000-01",
    version: "V800R021C00SPC100",
    vendor: "Huawei",
    compatibleModels: ["NetEngine 8000 M14", "NetEngine 8000 F1A"],
    releaseDate: "2026-04-15",
    fileSize: "842 MB",
    checksum: "SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    status: "stable",
    description: "升级修复了BGP内存泄露隐患与SRv6转发性能增强",
    downloadUrl: "/firmware/HW_NE8000_V800R021.cc",
    releaseNotes: [
      "修复高并发BGP邻居抖动导致的路由抖动异常",
      "优化SRv6 TE Policy组播报文转发延迟",
      "提升SSH/TLS加密套件安全等级，弃用弱加密算法",
    ],
  },
  {
    id: "FW-CS-CAT9K-02",
    version: "IOS-XE 17.09.04a",
    vendor: "Cisco",
    compatibleModels: ["Catalyst 9500-48Y4C", "Catalyst 9300-48P"],
    releaseDate: "2026-06-20",
    fileSize: "1.2 GB",
    checksum: "SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    status: "stable",
    description: "Cisco推荐维护版本，针对STACK协议与Macsec加密全面优化",
    downloadUrl: "/firmware/cat9k_iosxe.17.09.04a.SPA.bin",
    releaseNotes: [
      "解决StackWise-480堆叠掉卡异常重置问题",
      "增强802.1AE MACsec线速硬件转发稳定性",
      "补丁修复CVE-2026-21045 SNMP缓冲区溢出漏洞",
    ],
  },
  {
    id: "FW-H3C-COMWARE7-03",
    version: "Comware v7.1.064",
    vendor: "H3C",
    compatibleModels: ["MSR 3610-X1", "WX3510H-PWR", "S5560X-54S"],
    releaseDate: "2026-07-10",
    fileSize: "410 MB",
    checksum: "SHA256: a1d2c3b4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
    status: "stable",
    description: "更新WLAN Controller容量扩展及Comware 7稳定性补丁",
    downloadUrl: "/firmware/H3C_CMW710_R064.bin",
    releaseNotes: [
      "无线AP上线效率提升40%",
      "修复多VRF场景下OSPFv3路由计算高CPU占用问题",
    ],
  },
];

export const INITIAL_FIRMWARE_LOGS: FirmwareUpdateLog[] = [
  {
    id: "FLOG-501",
    deviceId: "DEV-1001",
    deviceName: "Core-Router-01",
    deviceModel: "NetEngine 8000 M14",
    fromVersion: "V800R020C10",
    toVersion: "V800R021C00SPC100",
    status: "success",
    operator: "张明",
    timestamp: "2026-08-01 02:30:15",
    details: "主备板卡平滑升级成功，丢包0，业务无感知。",
  },
  {
    id: "FLOG-502",
    deviceId: "DEV-1005",
    deviceName: "HQ-WLAN-AC01",
    deviceModel: "WX3510H-PWR",
    fromVersion: "Comware v7.1.048",
    toVersion: "Comware v7.1.050",
    status: "failed",
    operator: "系统管理员",
    timestamp: "2026-08-10 23:15:00",
    details: "校验和匹配正常，但重启后闪存空间不足导致配置加载异常，建议清理闪存空间后重试。",
  },
];

export const INITIAL_EVENT_LOGS: EventLog[] = [
  {
    id: "EVT-801",
    timestamp: "2026-08-12 09:12:44",
    deviceId: "DEV-1005",
    deviceName: "HQ-WLAN-AC01",
    level: "critical",
    title: "CPU与内存高占用告警",
    message: "设备 CPU 利用率已连续5分钟突破95%，无线AP掉线率升高！",
    resolved: false,
  },
  {
    id: "EVT-802",
    timestamp: "2026-08-12 08:45:10",
    deviceId: "DEV-1003",
    deviceName: "Border-FW-Master",
    level: "warning",
    title: "边界防火墙会话数高风险告警",
    message: "Untrust区域并发会话达到 1,420,000，接近容量上限(85%)。",
    resolved: false,
  },
  {
    id: "EVT-803",
    timestamp: "2026-08-11 18:22:00",
    deviceId: "DEV-1007",
    deviceName: "Branch-GW-Shenzhen",
    level: "critical",
    title: "设备链路中断",
    message: "分支接入网关 10.3.0.1 连续丢失ICMP心跳响应，设备判定为离线。",
    resolved: false,
  },
  {
    id: "EVT-804",
    timestamp: "2026-08-11 10:00:00",
    deviceId: "DEV-1002",
    deviceName: "HQ-Switch-Core-A",
    level: "info",
    title: "配置同步成功",
    message: "已通过模板 TMPL-102 成功下发 VLAN20 变更配置。",
    resolved: true,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "AUD-901",
    timestamp: "2026-08-12 09:15:00",
    username: "admin",
    userRole: "SUPER_ADMIN",
    ip: "192.168.1.100",
    actionType: "APPLY_CONFIG",
    module: "TEMPLATES",
    target: "Core-Router-01 (DEV-1001)",
    details: "应用模板 [华为路由器标准OSPF与BGP基础配置]，配置了 ROUTER_ID=10.0.0.1",
    riskLevel: "MEDIUM",
  },
  {
    id: "AUD-902",
    timestamp: "2026-08-12 08:45:20",
    username: "engineer_zhang",
    userRole: "NETWORK_ENGINEER",
    ip: "192.168.1.105",
    actionType: "UPDATE",
    module: "DEVICES",
    target: "Border-FW-Master (DEV-1003)",
    details: "修改设备状态为 [warning]，并将维护备注更新为 [等待夜间做会话表清理]",
    riskLevel: "LOW",
  },
  {
    id: "AUD-903",
    timestamp: "2026-08-11 23:00:00",
    username: "admin",
    userRole: "SUPER_ADMIN",
    ip: "192.168.1.100",
    actionType: "FIRMWARE_UPGRADE",
    module: "FIRMWARE",
    target: "HQ-WLAN-AC01 (DEV-1005)",
    details: "下发固件升级任务 Comware v7.1.050，任务结果: 失败（闪存空间不足）",
    riskLevel: "HIGH",
  },
  {
    id: "AUD-904",
    timestamp: "2026-08-10 14:30:10",
    username: "auditor_li",
    userRole: "AUDITOR",
    ip: "192.168.1.112",
    actionType: "LOGIN",
    module: "SYSTEM",
    target: "管理后台登录",
    details: "安全审计员账户登录成功，进行日常日志核查",
    riskLevel: "LOW",
  },
];

export const ROLE_PERMISSIONS: RolePermission[] = [
  {
    role: "SUPER_ADMIN",
    roleName: "超级管理员",
    description: "拥有对系统所有设备、配置、固件、用户和审计数据的全部管理权限",
    permissions: {
      deviceManage: true,
      deviceDelete: true,
      configEdit: true,
      configApply: true,
      firmwareUpdate: true,
      userManage: true,
      auditView: true,
    },
  },
  {
    role: "NETWORK_ENGINEER",
    roleName: "网络运维工程师",
    description: "可添加、编辑设备信息，编辑与下发配置模板，执行固件升级与网络监控",
    permissions: {
      deviceManage: true,
      deviceDelete: false,
      configEdit: true,
      configApply: true,
      firmwareUpdate: true,
      userManage: false,
      auditView: true,
    },
  },
  {
    role: "AUDITOR",
    roleName: "安全审计员",
    description: "仅具有查看设备状态、配置模板、监控图表及审计日志权限，无法修改或删除数据",
    permissions: {
      deviceManage: false,
      deviceDelete: false,
      configEdit: false,
      configApply: false,
      firmwareUpdate: false,
      userManage: false,
      auditView: true,
    },
  },
  {
    role: "GUEST",
    roleName: "访客 / 观察员",
    description: "只读视角，仅可浏览设备清单与网络监控拓扑，无法导出数据或下发更改",
    permissions: {
      deviceManage: false,
      deviceDelete: false,
      configEdit: false,
      configApply: false,
      firmwareUpdate: false,
      userManage: false,
      auditView: false,
    },
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "高危告警: 核心无线控制器 CPU 突破 95%",
    message: "设备 HQ-WLAN-AC01 (10.0.2.1) 出现死锁，请即刻排查！",
    time: "10 分钟前",
    type: "alert" as const,
    read: false,
  },
  {
    id: "notif-2",
    title: "AI 配置生成完成",
    message: "华为 NetEngine OSPF/BGP 模板自动化构建完毕",
    time: "1 小时前",
    type: "info" as const,
    read: false,
  },
  {
    id: "notif-3",
    title: "安全合规例行审计提醒",
    message: "李华 (安全审计员) 导出了最近7天的系统操作轨迹审计报告",
    time: "Yesterday",
    type: "system" as const,
    read: true,
  },
];

// Helper functions for LocalStorage persistence
const STORAGE_PREFIX = "netconfig_app_v1_";

export function loadStoredData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.error("Error reading localStorage key:", key, e);
    return defaultValue;
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error("Error setting localStorage key:", key, e);
  }
}
