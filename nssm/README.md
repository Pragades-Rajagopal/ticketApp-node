## NSSM commands

Tool is hosted in Windows Server as a service "tt_tool" using NSSM. Below commands are used to install the service and operate it.

> Note: After installation, alternatively, service can be operated in Task Manager

> Execute below commands with root privileges

### Service installation/setup

```
nssm install tt_tool node <path_to_/src/app.js>
```

### Get service detail

```
nssm get tt_tool
```

### Starting & stopping the service

```
nssm start tt_tool

nssm stop tt_tool

nssm restart tt_tool
```

### Get service status

```
nssm status tt_tool
```

### Remove service

```
nssm remove tt_tool confirm
```

> Warning: Please execute above commands with caution!