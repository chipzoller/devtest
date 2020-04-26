---
title: "VMworld 2017, Day 2 Announcements"
date: 2017-08-30
description: "Announcements from day 2 of VMworld 2017."
# author: "John Doe"
draft: false
menu: main
# featureImage: "/images/path/file.jpg"
categories:
  - Technology
tags:
  - vmworld
---

Day two was a little slower on the release/announcements side, but there were still a few things mentioned both at VMworld, and also press releases that weren’t spoken at the conference. I’ll give you a run-down of both of those things so we cover all the bases.

* Pivotal Container Service (PKS):  Yes, the word “container” does not start with the letter “k,” however the “K” in this instance is for Kubernetes, because that is the technology used to bring this offering to the table. Press release can be found [here](https://www.vmware.com/company/news/releases/vmw-newsfeed.VMware-and-Pivotal-Launch-Pivotal-Container-Service-(PKS)-and-Collaborate-with-Google-Cloud-to-Bring-Kubernetes-to-Enterprise-Customers.2184911.html). Essentially, this offering allows customers to operationalize in a production-ready environment containers using the Kubernetes orchestration and scheduling engine. It allows full lifecycle management and maintenance including things like rolling upgrades, monitoring, etc on the K8s (shorthand for “Kubernetes” there) infrastructure itself, which isn’t provided natively. So it can offer a lot of value to customers who cannot roll their own container infrastructure. The solution, scheduled to go GA in December I was told in a session on Tuesday, will initially support vSphere as the underlying technology, but will eventually support VMware Cloud on AWS. This offering comes with NSX-T as well as Harbor, VMware’s own enterprise-grade container registry system. Here’s [another article](https://techcrunch.com/2017/08/29/pivotal-vmware-google-partner-on-container-project/) covering the same.

* vCloud Director 9.0:  Announced in only a [blog post here](https://blogs.vmware.com/vcloud/2017/08/vmware-announces-new-vcloud-director-9-0.html), this is the follow-up release from February’s 8.20 release. The main changes here are a new HTML5 UI (as opposed to the aging Flex-based architecture), and a plug-in for vCenter called vCloud Director Extender that allows customers to connect to their cloud provider’s vCD environment.

* NSX Cloud:  This was kind of rolled in with yesterday’s announcements around VMware Cloud, but it was called out specifically in a couple slides during this morning’s keynote session. The idea behind NSX cloud is to be able to span both on-premises and public cloud environments to give customers a common networking layer both for security and communications purposes. And namely in this list of public clouds is Microsoft Azure, which is nice to see given that the star of VMworld this year seems to be VMware Cloud on AWS.

* Horizon 7.3 sneak peek:  This was in a [blog post only](https://blogs.vmware.com/euc/2017/08/vmware-horizon-7-3-sneak-peek.html) but gives a few hints what might be released in Horizon 7.3.  Skype for Business, session pre-launch and linger, NVIDIA management pack for vROps are all things called out here. Check the page for more details.

* VMware Integrated OpenStack 4.0:  Again, another [blog-only post](https://blogs.vmware.com/openstack/vmware-integrated-openstack-4-0/), but big for those using VIO. This 4.0 release punches up to the Ocata release and includes support for containers, vRA, multi vCenter support, and others.

* vRealize Network Insight 3.5:  The announcement for vRNI 3.5 also flew under the radar and was covered in a blog post [here](https://blogs.vmware.com/management/2017/08/vrealize-network-insight-3-5.html). The teams have been moving extremely quickly on this product, born of the Arkin acquisition last year. The major features coming in this release include NSX IPFIX flow integration, new dashboards, support for more third-party devices such as Checkpoint, and most interesting is the tool will be available as a SaaS offering for those who prefer that consumption model.

That’s a wrap for today, folks. Although the keynote was a little light on announcements, I think (and hope) I’ve covered everything else that was quietly mentioned in writing only. Watch for the next update on the happenings from VMworld 2017 here.
