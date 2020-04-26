---
title: "Docker Engine on Windows and Linux through vRealize Automation"
date: 2016-12-06
description: "Docker Engine blueprints for vRealize Automation."
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2016-12/docker-engine-blueprints-for-vra/featured.jpg"
categories:
  - Technology
tags:
  - docker
  - vra
  - vrealize
---

Docker is a topic that seems all the rage today, and people and organizations are scrambling to understand the technology in order to power their next-generation apps with methodologies such as continuous delivery and micro-services. In order to make standing up Docker easier for those with vRealize Automation, I’ve made a couple of software blueprints that can be dropped on top of your existing machine blueprints which allow you to provision Docker hosts on both Linux and Windows!  Yes, that is Linux and Windows since Docker is now a functional technology on top of Windows Server 2016.  You can get both of these blueprints for free from the [VMware Sample Exchange](https://developercenter.vmware.com/samples), which, if you don’t know about it, is a great place where folks from the community post everything from vRA blueprints to PowerShell scripts and vRO packages.

## [**Linux Docker Engine**](https://developercenter.vmware.com/samples/1455/linux-docker-engine)

## [**Windows Docker Engine**](https://developercenter.vmware.com/samples/1462/windows-docker-engine)

Both of these blueprints do the following:

1. Get the latest version of Docker from the respective online depots.
2. Install a single engine instance.
3. Open the remote API on port 2375 (insecure).

In order to use these, you’ll need a few things:

1. vRealize Automation 7.0, 7.1, or 7.2. In the case of the Windows Docker Engine blueprint, you’ll need vRA 7.2 due to [Windows Server 2016 support only there](https://www.vmware.com/pdf/vrealize-automation-72-support-matrix.pdf).
2. Enterprise license.
3. Existing Linux and Windows Server 2016 template VMs.
4. vRA [CloudClient](https://my.vmware.com/group/vmware/details?downloadGroup=CLOUDCLIENT_430&productId=624) to import the content into your vRA environment.
5. Guest agent and software bootstrap agent installed on your templates.

Let’s go through the quick steps to get one of these blueprints installed and available. First, download and install the CloudClient on a Windows workstation. Bring up the CLI by starting cloudclient.bat. Login to your vRA environment by issuing a `vra login userpass --tenant <my_tenant>` and input your vRA server FQDN when prompted. Make sure you’ve downloaded one of the ZIP files representing either the Linux or Windows software component, and after authentication do a `vra content import --path <path_to_zip> --resolution skip`. If there are no errors, you should see something like the following:

![Blueprint imported via CloudClient](/images/2016-12/docker-engine-blueprints-for-vra/image1.png)

If you get a success message, you should now be able to go into your Software Components blueprints and see the one you imported. From there, all that’s left is to drag-and-drop that component onto a new or existing machine blueprint.

![On the designer canvas, select Software Components](/images/2016-12/docker-engine-blueprints-for-vra/image2.png)

![Drag-and-drop one of the newly-imported blueprints to a machine](/images/2016-12/docker-engine-blueprints-for-vra/image3.png)

For the Windows blueprint, make sure the guest agent is installed and running as Local System or the script will not work properly. Also, for the Windows blueprint, make sure to set a user/pass combination in the Properties section to enable the one-time auto logon capability.

![Properties on the Windows blueprint](/images/2016-12/docker-engine-blueprints-for-vra/image4.png)

Now, all that’s left is to entitle your item and request it, then sit back and watch as your new Docker host is built for you!

![Request catalog item containing software component](/images/2016-12/docker-engine-blueprints-for-vra/image5.png)

![Catalog request form should be completed](/images/2016-12/docker-engine-blueprints-for-vra/image6.png)

Check the progress of your request and see the various lifecycle stages progress.

![Show the software component execution information](/images/2016-12/docker-engine-blueprints-for-vra/image7.png)

![Software component logs, Install phase](/images/2016-12/docker-engine-blueprints-for-vra/image8.png)

![Software component logs, Configure phase](/images/2016-12/docker-engine-blueprints-for-vra/image9.png)

![Software component logs, Start phase](/images/2016-12/docker-engine-blueprints-for-vra/image10.png)
