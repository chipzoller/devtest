---
title: "vRO 5.5 DNS Reverts"
date: 2015-10-08
description: "DNS setting for the vRealize Orchestrator appliance reverts to default."
# author: "John Doe"
draft: false
toc: false
menu: main
# featureImage: "/images/path/file.jpg"
categories:
  - Technology
tags:
  - vro
---

vRealize Orchestrator is VMware’s automation and workflow engine that unlocks the true power of vRealize Automation enabling things like custom machine provisioning/de-provisioning steps and any external systems that may need to be called.

For those still using vCenter Orchestrator 5.5, the appliance sees to have one strange issue that might impact those making changes to the underlying infrastructure. The appliance has an odd tendency to revert DNS to the previously provisioned values even after changing them in the configurator. This issue has been documented here (vCO v5.5.2.1) and, to a lesser extent, here (vCSA). The information provided by VMware in the release notes to vCO is correct except for one important detail—the appliance must be power cycled (not rebooted) to re-read and reapply the new DNS IP information.

When vCO and certain other appliances are deployed initially with static IP information, vApp properties are created specific to that VM which get saved and applied when it first boots to speed time of deployment. It is visible after editing settings on the VM and checking the vApp Options tab:

![vApp Options on the vRO appliance](/images/2015-10/vco-55-dns-reverts/image1.png)

If the DNS server information needs to be changed thereafter, normally the web-based interface (VAMI) listening on port 5480 is used to change this info, but although the new DNS IP will be updated and used immediately by the system, after a reboot the appliance will revert to using the originally-configured IP. This could render the vCO/vRO appliance useless if it has been configured to talk to external services (AD, SQL, etc.) via name and not IP. The best way to change DNS if required is to change the DNS IP in the vApp Properties (the VAMI may still be used if the new IP is needed immediately) and then power off/power on the appliance. A simple guest restart of the appliance will not work and it will come back with the last DNS IP that was configured before the last power cycle.

In short, IP settings may be changed in the VAMI to take immediate effect. vApp properties, if specified at time of deployment, are read ONLY at time of boot and are not updated automatically. The vApp properties will override the VAMI properties. In order to have changes in the VAMI persist, one must change them in the VAMI, change them identically in the vApp properties, then shutdown and power on the appliance.

Note that this bug does not affect the latest version of vRealize Orchestrator (6.0.3 as of this writing), and the vApp properties are read only upon first boot of the appliance. Thereafter, any changes made in the VAMI will persist after both guest reboots and virtual machine power cycles.
