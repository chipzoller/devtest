---
title: "Deploying End Point Operations Agents through vRA"
date: 2018-01-02
description: "Custom software components to deploy End Point Operations agents through vRA."
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2018-01/deploying-epops-agents-through-vra/featured.jpg"
categories:
  - Technology
tags:
  - vrops
  - vrealize
  - vra
---

vRealize Automation is useful for deploying a variety of different items as-a-service, from simple IaaS to databases to container hosts and, of course applications. And most of these have been demonstrated to date. One other piece that is often forgotten about is monitoring agents on these systems, or maybe it’s done as a manual process after the fact (which defeats the purpose of cloud automation). In the past, I’ve provided a few blueprints that automates this process for the Log Insight agents for [Windows](https://code.vmware.com/samples/2799/log-insight-agent-for-windows) and [Linux](https://code.vmware.com/samples/2798/log-insight-agent-for-linux). But in this blog post, I’m making available the last two types of monitoring agents from VMware: End Point Operations.

For those not familiar, End Point Operations (or EpOps for short) is a functionality provided with vRealize Operations Manager (vROps) and originally came from VMware’s Hyperic offering. EpOps agents are software packages installed within the guest OS that connect to and report back to the vROps cluster information about guest-specific stats and metrics, including things like application metrics if enabled through one or more management packs. There are several blogs that cover EpOps and how to install and configure it, so I won’t start from scratch here. What I’ve done is take these agents and build software blueprints that allow you to integrate them into your existing machine blueprints and automate their deployment, configuration, and even uninstallation from within vRealize Automation. These blueprints are being offered to the community freely on Samples Exchange and were built and tested on vROps 6.5, 6.6, and 6.6.1 with vRA 7.2 and 7.3. As with all software components, you require a vRealize Automation Enterprise license to use them. Let’s walk through these blueprints and how they work.

After importation through CloudClient or API, you’ll see several properties that are required.

![Properties on a software component](/images/2018-01/deploying-epops-agents-through-vra/image3.png)

They’re all fairly self-explanatory and I’ve made sure to list helpful descriptions to guide you through their configuration. This blueprint assumes the EpOps agent is stored on a SMB share reachable over the network from the deployed VM. It also requires you have a vROps instance ready to go and can provide the cert thumbprint as well as credentials with which the agent has permission to register itself. Be sure to list the share path in the correct format if this is Linux or Windows blueprint as there is a difference (the description helps). On the Actions page, there’s nothing you need to configure, but do note that I’ve built Install, Configure, Start, AND Uninstall phases. The uninstall phase is significant as this phase will unregister the EpOps agent from vROps as well as any of its child items upon destruction of the VM. That’s super helpful as it avoid you from having to go into vROps and clearing out offline agents from the Inventory Explorer. More on this later.

Once you’ve configured the software component, add it to a blueprint. I’ll illustrate on a CentOS 7 blueprint in my lab. Drag it onto a machine blueprint that is configured.

![EpOps Linux agent software component added to machine object](/images/2018-01/deploying-epops-agents-through-vra/image4.png)

No properties need to be set at this point unless you want them to be by setting an override in the component. Entitle the catalog item and start a provision.

![vRA deployment request](/images/2018-01/deploying-epops-agents-through-vra/image5.png)

This one was successful in my case. By clicking on the ellipsis button, you can see information on each state.

![Software component logs, Install](/images/2018-01/deploying-epops-agents-through-vra/image6.png)

In the case of Linux, cifs-utils will be downloaded so the SMB share can be mounted.

![Software component logs, Configure](/images/2018-01/deploying-epops-agents-through-vra/image7.png)

For Configure, the software component will change the runas user to root. Otherwise, the agent will fail to start after reboot because it tries to run it as a local user called “epops.”

![Software component logs, Start](/images/2018-01/deploying-epops-agents-through-vra/image8.png)

At start, the agent will register itself with the vROps cluster and start up. It checks to ensure this process happened successfully. If not, it considers installation to be failed, so ensure your vROps is up and running before trying to build.

Once the provision is successful, you’ll see it show up in your inventory.

![EpOps agent reporting in](/images/2018-01/deploying-epops-agents-through-vra/image9.png)

![Summary screen of agent](/images/2018-01/deploying-epops-agents-through-vra/image10.png)

Cool, so there’s the new agent all ready to go. Now you can add other objects inside the guest you wish to monitor. Let’s set up a monitor for the Java process.

![Java process summary screen](/images/2018-01/deploying-epops-agents-through-vra/image11.png)

It’s show up and is sending data. Rinse and repeat for whatever you want to see. Now, let’s destroy this deployment and see what happens.

![vRA destroy deployment action](/images/2018-01/deploying-epops-agents-through-vra/image12.png)

Before the machine is deleted from vCenter, the uninstall phase of the component runs.

![Software component logs, Uninstall](/images/2018-01/deploying-epops-agents-through-vra/image13.png)

In order to recycle the code from the Windows blueprint, the Linux blueprint will pull down and install PowerShell Core and run the same script. The PowerShell has the agent call out via REST to vROps and discover itself in inventory, then any items that might have been monitored for that same system and remove them all. This assumes the hostname of the machine matches what is in vROps’ inventory, which it should since EpOps agents register their own hostnames. So not only did this destroy the agent and its entry in vROps, but also the Java monitor we put in place.

![vROps inventory objects removed related to machine](/images/2018-01/deploying-epops-agents-through-vra/image14.png)

![vROps inventory view](/images/2018-01/deploying-epops-agents-through-vra/image15.png)

As you can see, no more agent, and no more monitors. How’s that for cleaning up after itself?! Very convenient in that all portions of the agent lifecycle are managed for you automatically.

Both Windows and Linux software components work exactly the same and, as shown, even reuse the same PowerShell for the uninstall phase. This PowerShell code proved to be tricky under Linux since I developed it with a much earlier version of [PS Core](https://github.com/PowerShell/PowerShell) and in the process discovered a bug which was subsequently fixed in [beta 9](https://github.com/PowerShell/PowerShell/blob/master/CHANGELOG.md). I thought it was pretty cool I could contribute in some small way to improving PowerShell Core!

I hope you find these blueprints useful and will provide any feedback you might have. They are intended as a work in progress as I know there are some things that could (and will) be better, so please feel free to leave some feedback if you find them useful or, if not, what isn’t working for you.

### [EpOps Agent for Windows Blueprint](https://code.vmware.com/samples/3483/end-point-operations-agent-for-windows?h=Sample)

### [EpOps Agent for Linux Blueprint](https://code.vmware.com/samples/3482/end-point-operations-agent-for-linux?h=Sample)
