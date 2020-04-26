---
title: "Why Kubernetes on Virtual Machines?"
date: 2020-01-17T18:35:21-05:00
description: "The case for Kubernetes on virtual machines as opposed to bare metal."
# author: "John Doe"
draft: false
toc: false
menu: main
featureImage: "/images/2020-01/why-k8s-on-vms/featured.jpg"
categories:
  - Technology
tags:
  - k8s
  - vsphere
---

One of the arguments or debates (depending on how generous you are) that continues to rage in the world of Kubernetes is the old "bare metal versus virtual machines" subject. Some people seem to be all in on bare metal while you have those staunch opponents (as well as some hilarious memes) who advise not even attempting it.

![Kubernetes bare metal meme](/images/2020-01/why-k8s-on-vms/k8s-meme.jpg)

The reality, of course, is an "it depends" moment, with pros and cons on each side. That being said, I've compiled a list of the most compelling reasons to argue for Kubernetes on virtual machines.

1. **No cloud provider, no storage/network options**

When running Kubernetes on bare metal, you don't have the option of a cloud provider interface (CPI) which handles a lot of the underpinning infrastructure. In the case of AWS, for example, that CPI could produce an ELB if you asked for a service of type LoadBalancer. And on vSphere that might produce new VMs for you in a specific resource pool. There's also no storage and network options outside of the generic CNIs and CPIs out there. For storage, that means much more difficulty as you have to provide shared storage and hope that vendor has something available.

2. **No fleet management, node scale. Automating bare metal very difficult.**

You're on your own when it comes to managing that fleet of physical nodes because it's an entirely physical, manual process. Scaling out to new workers means you have to physically have unused servers just standing by, which means greatly increased capex costs. And automating the bootstrapping process of those physical nodes is also very challenging as there aren't a whole lot of good tools that can do it end-to-end style. All of these things you need when running Kubernetes in production, and so you've got to recreate the wheel. With VMs? Just clone from a template and you're done. There's countless ways to automate that process with just about any tool you can imagine.

3. **Hardware issues, firmware, drivers, tuning. Linux distro compatibility.**

With bare metal, your OS sits on a server and K8s on top of that. So the OS itself sees actual, real physical hardware. That means any of that hardware which fails impacts K8s. And it's a nightmare verifying compatibility of firmware, drivers, and tuning those for your distro. You have to verify the support for that whole matrix of combinations. Even a single NIC revision could create problems. On virtual machines, the precise physical details are abstracted away from you as the hypervisor presents a set of consistent, virtualized resources.

4. **No built-in monitoring for bare metal, not too many solutions out there for that.**

Bare metal has no integrated monitoring, and it's often up to the vendor. Even then, it's a bolt-on, often times costly, and may be a fragmented approach. Even third-party software isn't so great at watching disparate systems at the hardware level. This is already solved with tons of tools in a virtualized environment like vSphere, in addition to lots of third-party management packs and tools to enhance it even further.

5. **Procurement process and installation. Heterogeneous hardware.**

Someone has to buy, install, and configure that bare metal hardware which runs your K8s cluster. How fast is your procurement process? Typically it's at best a few weeks. The alternative is having servers in a rack literally doing nothing in hopes of later joining the cluster. How much does that cost? What about heterogeneous hardware where that Gen 10 server on which you built your entire farm is end-of-life and the vendor won't sell you any more? With virtualization, no problem. Nodes are VMs, just a collection of files, and the hypervisor abstracts the physical server details to a set of virtualized hardware. With technology like Enhanced vMotion Compatibility (EVC), you can pool that disparate hardware in the same group even. And VMs can be cloned and started in matter of minutes.

6. **Persistent storage on bare metal way more difficult.**

Persistent storage on Kubernetes is challenging anyhow, and more and more workloads are coming into K8s with that need. 7 out of 10 applications that run in containers are stateful applications (source: Datadog). On bare metal, you've got way fewer choices. Want external storage? Now you're adding more NICs or HBAs into the equation (see point 3). You're also going to find a third-party CSI to interface with it, and the options are limited. On VMs, that CPI or CSI intercepts calls for PVs and PVCs and translates them into virtual disks. You can even consume storage policies inside your K8s cluster just like your VMs do. And, obviously, all of those workloads can land on exactly the same storage backend.

7. **Config management**

You've got a fleet of physical servers, so how are you going to manage their configuration? You'll need some config management tool for that. Factor in firmware and driver updates, you're making that much more complex all of a sudden. Can you test that? If virtualized, your nodes are templates, and what you do to one template can simply be cloned off to many more. You might still use a config management tool, but you could also just remaster that one template and roll it out instead.

8. **Patching process on hardware, must kill workloads**

Kubernetes has no concept of or ability to move pods to other nodes. When you patch physical hardware running K8s, you've got to kill those workloads to allow kube-scheduler to schedule them to another node. Maybe not so bad. But what if you're running over one hundred pods on that node? And what if there are StatefulSets running there? That can have a big resource impact across the cluster. With VMs, simply vMotion or live migrate that node to another host while you take the first one down for maintenance. Looking at a platform like VxRail and you can patch the hardware AND hypervisors in one fell, automatic swoop while you eat dinner. Simple.

9. **Security isolation and multi-tenancy. Blast radius.**

With physical machines, you're more likely to use some really large boxes if your justification is being able to squeeze every last ounce of resource utilization out of them. That's a big blast radius if it fails. What about running multi-tenant workloads there? Very likely you can't afford to have many clusters due to cost and technical complexity, so you're opting for one or two really large ones. Namespaces are only a form of soft multi-tenancy, so now you're wasting resources to increase security. Or you're throwing more money to add even more clusters. There goes your argument about VMs taking too much overhead to run!

10. **No dynamic resource utilization (DRS)**

On bare metal, there is no DRS-like functionality, so what's on that box stays there until K8s kills it. This can produce some real hot spots in your datacenter. Contrast that with virtualization on vSphere, and DRS moves those nodes to other hosts to optimize their resource impact.

11. **No failure recovery of hardware.**

When a node dies if it's a physical server, it's dead until you intervene. That means potentially a big chunk of your resources are gone. If it's a control plane node, you're either down or vulnerable. If it's a worker node and was running pods with persistent storage, it'll be at least 6 minutes until K8s can reschedule that on another node. It's 5 minutes for it to even declare that hosed up server as dead. On VMs with vSphere, HA can restart that control plane/worker on a surviving host in under a minute, which is even before K8s knows anything happened. And if using something like Enterprise PKS (which deploys K8s clusters as VMs) and the node is just wholesale deleted, BOSH can deploy a new one for you in less time than it takes for Kubernetes to notice.

12. **No extra availbility features.**

If you've gone the route of physical K8s, a box is a box. You do everything you can to prevent a reduction in availability, but there's only so much you can do. Those boxes aren't aware of each other and their roles outside of what K8s knows, but K8s can't power on your server. Well, on vSphere you have HA restart priorities, orchestrated restarts, and proactive HA along with anti-affinity rules and fault domains to ensure you have the absolute best chance of remaining available. And these aren't things you have to script or program into a config management system. They come out-of-the-box and most can be enabled with a couple of clicks.

13. **Availability of snapshots.**

What if you want to test a new/updated package? Since you're using hardware, what about testing an updated driver? Or a library that had a critical vulnerability? Hope you've got some stand-by test systems out there and an automated roll-back plan. On virtual machines, just about every platform has some concept of snapshots where you can revert if things go haywire. Not so on physical gear. Better test carefully.
\
\
\
As you can see, that's a lot, and there are probably more if I try harder. In my opinion, although there are benefits you can realize when using physical servers for your Kubernetes cluster, those benefits are ***far*** eclipsed by the flexibility, security, and resource scheduling abilities you gain when running as virtual machines. Look no further than, well, every public cloud provider in the world. No matter if it's their PaaS solution or something else, on the backend those Kubernetes nodes are all virtual machines. It would quite honestly be near impossible to automate bare metal in the same way VMs are with these platforms. So, given all of this, why use bare metal?
