---
title: "Upgrading vSphere through migration"
date: 2017-11-27
description: "How to upgrade vSphere by migrating to a new instance rather than upgrading in-place."
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2017-11/upgrading-vsphere-through-migration/featured.jpg"
categories:
  - Technology
tags:
  - vsphere
---

## Introduction

The topic of vSphere upgrades is a hot one with every new release of VMware’s flagship platform. Architectures change, new features are introduced, old ones are removed, and so everyone is scrambling to figure out how to move to the next version and what process they should use. There are generally two approaches when it comes to vSphere upgrades: in-place upgrade or migrate. In the in-place upgrade process, the existing vCenter Server is preserved and transformed into the new version while in the migration method, new resources are provisioned using the new version which then take over from the old resources. Primarily the new resources consist of the vCenter Server and its accoutrement while ESXi hosts are simply moved over to it and then upgraded. Therefore, both strategies see ESXi hosts being upgraded in-place. While there are pros and cons to each approach, I want to explore the migration method in particular since this is a question I often get from customers and the community at large. In addition, the in-place upgrade approach is fairly well documented with steps and procedures from VMware while the migration method receives little, if any, attention. Let’s go through the process of the migration method and discuss how it works, what’s involved, and the gotchas of which to be cognizant.

## Why Migrate?

Upgrading vSphere is no simple task regardless how you go about it. Although VMware has done a good job of making this process easier and more reliable, there are still a number of things you as an engineer or administrator are responsible for doing to ensure it ultimately succeeds. Before deciding if you want to go straight to a migration rather than in-place upgrade, we need to lay out the pros and cons of each. Here’s a table which has the most salient points.

![In-place Upgrade vs Migrate Pros and Cons](/images/2017-11/upgrading-vsphere-through-migration/table.png)

The in-place upgrade has advantages like preserving performance data because the vCenter database is kept intact. Since it’s the same vCenter, the identity is carried forward as are all the settings. It can sometimes be quicker to upgrade since you’re not standing up a new vCenter, and if you’re moving from Windows to the appliance there’s a handy migration utility that streamlines this process. Lastly, any solutions or other third-party applications you have which rely on vCenter continue to work (if they’re compatible).

However, there are some serious drawbacks to consider as well. Going with an in-place upgrade means settings which may not be optimal on the new version are carried forward rather than altered. In preserving the configurations, you may also be moving things along which were mistakes or not according to best practice to begin with. There’s a much higher risk of failure due to things like [database](https://kb.vmware.com/s/article/2147558) issues, which are rampant, [underlying OS issues](https://kb.vmware.com/s/article/2147895), and the fact that in any enterprise software development, the majority of the efforts in QA are focused on testing net new deployments. It’s only understandable that vendors focus on predictable deployment patterns rather than trying to model millions of possible permutations of different versions crossed with different settings—it’s a matrix from hell. An in-place upgrade has a higher risk of breaking as future patches and updates are made to the software then scabbed on. A combination of legacy settings and non-optimizations create somewhat of a ticking time bomb for any further updates owing again to the possibilities when in the developing and test phases. And last, an in-place upgrade won’t allow you to change your vCenter architecture. It’s very common to see vCenter deployments that, due to time, budget, personnel, or other constraints were slung together and not well planned and thought out. Perhaps the architecture was wrong on day one, or maybe your company has simply grown organically or through investitures and you now find the need for multiple vCenters and a more resilient architecture. In-place upgrades don’t allow you to change what you have, merely stand pat and bump up to the latest release.

When it comes to the migration path, you still have some negatives that should be understood. In a migration, since this is a new vCenter, there’s more planning that is involved as you understand dependencies and port elements over. This translates to more time spent on the overall upgrade process. And because this is a lift-and-shift operation, you’ll lose historical data in the vCenter database as well as be required to repoint any external applications that talk to vCenter. More on all this in the Moving to Migrate section.

The positive aspects of a migration as opposed to an in-place upgrade are extremely compelling, however. This is a fresh, clean slate, so you have the opportunity to right past wrongs, fix non-optimal settings, and conform to best practices without having to worry about transporting and then readopting a bunch of junk from prior versions. If your present vCenter environment has been upgraded from at least one major version in the past (for example, from vSphere 4.1 to vSphere 5.0), this is usually a clear signal to break with in-place upgrades and opt for a migration. The migration process is much more controlled and so you can take the time to be thorough and fix issues as they arise without worrying about downtime. The risk of failure is very slight because everything is new and fresh so no worrying about database corruption or rogue tables killing your upgrade. Since this is essentially a new environment, future patches and upgrades are much more likely to go without incident because you are on a common, known-good platform. And, lastly, you can learn from prior mistakes, assess the needs of your company, and correct upon earlier architectures by designing a new one and putting it into play. When the time comes and you’re satisfied, you can then begin to bring things over piece by piece until the legacy environment is entirely vacant and deprecated, then dispose of it forever.

Weigh each option carefully to determine if the pros column outweighs the cons column in your case. And for some, an in-place upgrade is the only possibility due to a variety of reasons. However, keep in mind the ultimate goal with any upgrade is not only to satisfy the primary objective of moving to the later version, but to ensure the platform remains stable, reliable, secure, and performant. Pursuant to those goals, it has been my experience that a lift-and-shift migrate, while having some leg work involved, ultimately produces the best result in the long run and sets you up for a more stable vSphere.

## Moving to Migrate

In a vSphere migration process, there are three large steps that occur and, while they sound simple, are actually complex in the implications that arise from such a movement.

1. Stand up new vCenter on new version
2. Move ESXi hosts to new vCenter
3. Upgrade ESXi hosts

Leading up to these steps is much planning in figuring out how exactly to do this. The devil, as they say, is in the details. Because this is essentially a new vCenter infrastructure design, we have the opportunity to adjust what might not have worked so well in the past and adopt a clean and new architecture that better suits our needs. Some questions to ask and then answer include:

1. What type of vCenter platform will I use?
2. What will the size of my inventory be?
3. How will this grow in the foreseeable future?
4. Will I use an external PSC?
5. Do I need to link additional vCenter?

Obviously, the answers to these questions will be specific to your needs and that of the business and so are out of scope for this particular article, with one exception being the vCenter platform. Because [Windows-based vCenters are going away](https://blogs.vmware.com/vsphere/2017/08/farewell-vcenter-server-windows.html), the appliance should be the only thing on your radar. The point being that you are planning for a greenfield deployment as if your existing datacenter was a new one entirely. Once you’ve settled on a vCenter architecture, we have to get from the current state to the new state. This is where the next batch of planning comes in. Because of the complexities of vCenter and the various features it enables (which you may be using), there are a whole host of things that must be moved and due diligence done before swinging hosts. An exhaustive list is not possible, but here are the 10 major things you should check and plan to either move or recreate. Keep in mind that although this list is tailored towards a migration, several items are universal irrespective of which upgrade method you elect.

## 10 Things to Check Before Migrating

---

### 1. Custom roles and permissions

Any roles you’ve cloned and customized in your existing vCenter will not be moved with hosts and so must be recreated. Also, if you’ve applied those custom roles to specific objects in the vCenter hierarchy, those will need to be documented and recreated. Even if not using custom roles, existing out-of-the-box roles that are applied at granular levels inside vCenter will need to be recreated.

### 2. Distributed Switch

The vDS is a vCenter-only construct and will have to be dealt with first. While you can backup and restore that vDS via the web client, hosts will have to be migrated to a vSS first before vCenter will allow you to disconnect them. This is a topic unto itself, but you will need two uplinks as a minimum to perform such a migration as well as some careful planning. It can be done with VMs online, but the point being you have to get to a vSS first, then reverse the process later.

### 3. Folders, Resource Pools, Compute/Datastore Clusters

Once again, these are all vCenter constructs and will not follow the hosts. Any vSphere folders, resource pools, compute or datastore clusters will need to be recreated on the destination. Other vCenter-specific resources include storage policies, customization specs, host profiles, vSphere tags, DRS rules, and licenses. While some of these objects have native, GUI-driven exportation abilities like host profiles as shown below, others like vSphere folders will require you drop down to [PowerCLI](https://www.vmware.com/support/developer/PowerCLI/) and do some scripting. In most cases, there are existing PowerShell scripts you can leverage to help, but you’ll need to consider these before swinging hosts.

![Right-click context menu on host profile](/images/2017-11/upgrading-vsphere-through-migration/image1.png)

### 4. ESXi version compatibility

In vSphere 6.5, for example, vCenter 6.5 cannot manage hosts below 5.5 and so before committing to this process, you need to ensure the existing ESXi hosts will support being connected to the next version of vCenter prior to them being upgraded.

### 5. Hardware support (compute, storage, network)

Further to #4, you must check your hosts, storage, and network against the [HCL](https://www.vmware.com/resources/compatibility/search.php) to ensure they will support being upgraded to the target new version. This is something that is overlooked far too often and leads to major issues. Vendors are the ones who usually do compatibility testing on their platforms, and so not all servers will support the latest version. In order to be in a safe place if you need support, all hardware must be validated against the HCL. Also, don’t forget about your physical network and storage equipment. These must be validated every bit as much as your ESXi hosts.

### 6. Firmware updates

And further to #5 is the matter of firmware updates for the said physical equipment. Although you may have validated that your servers and storage are indeed supported with the latest version of vSphere, they may not be running a compatible or supported version of the underlying firmware. This can be critically important if you wish to avoid outages and instability in your vSphere platform. Every piece of hardware on the [HCL](https://www.vmware.com/resources/compatibility/search.php) contains corresponding validated firmware that forms the support statement.

![VMware HCL](/images/2017-11/upgrading-vsphere-through-migration/image2.png)

### 7. vSAN, NSX, and other VMware solutions

This is a very broad topic, but if you’re running vSAN or NSX then there are specific validation that must take place there. Any other VMware solutions you may have such as vROps, vRA, SRM, Log Insight, Infrastructure Navigator, Horizon View, etc. must all be checked for their individual levels of support and interoperation with the new version. Use the [Interoperability Matrix](https://www.vmware.com/resources/compatibility/sim/interop_matrix.php) to check these solutions, and then use the [KB](https://kb.vmware.com/s/article/2147289) for proper upgrade order in the case of vSphere 6.5. For example, if you are using NSX, you may need to upgrade it before you perform the migration. Also, while not so much a concern any longer since vCenter 6.5 now has [it baked in](https://blogs.vmware.com/vsphere/2016/12/vmware-vsphere-update-manager-6-5-now-embedded-vcenter-server-appliance.html), is Update Manager. Some shops are very particular about their VUM installations. This is something else you must leave in the dust, so make preparations to migrate any builds, patches, and baselines to the new vCenter. Lastly, if using Auto Deploy then you’ll want to take that into consideration as well since it has some special requirements.

### 8. Plug-ins

Also a broad topic but any third-party plug-ins you might have, for example with your storage vendor, will need to be validated, possibly upgraded, then migrated or reregistered against the new vCenter. Check vCenter for a list of these under Administration -> Solutions heading at Client Plug-Ins and vCenter Server Extensions. For deeper insight into what is registered and where it is, see [William Lam’s article](https://www.virtuallyghetto.com/2010/07/how-to-unregister-vcenter.html) on using the vCenter MOB. Check with each respective vendor to figure out what that process may be and if you’ll need to perform any sort of backup or restore procedure for the data that may have been created or managed by those plug-ins.

### 9. SEAT data

Stats, Events, Alarms, and Tasks (SEAT) data will be left behind in your existing vCenter because this is all stored in the database and does not travel with the hosts. Stats are the performance statistics when you open the performance charts on an object. Events are any event on any object accessible from the Tasks and Events pane. Alarms are any existing, active alarms as well as those you have customized plus those created automatically by other solutions or plug-ins. Tasks are any records of activities performed manually or programmatically and serve as an audit log. If you’re using something like vROps, most of this information will be preserved there, but if not, be cognizant that you must give this up once hosts are swung.

### 10. Backup, replication, and monitoring

Very important and often overlooked. Special applications such as backup, replication, and monitoring will need to be validated for support and functionality, but will also need to be reconfigured or updated once the resources for which they are responsible are moved elsewhere. vCenter tracks objects by several internal IDs, the main one being the MoRef ID (Managed Object Reference). This tracking system assigns a unique ID to each VM, host, folder, etc., and it is very often this ID that such applications key off of when associating their inventories. For example, in the case of Veeam Backup & Replication, when swinging hosts and their VMs over to a new vCenter, each object will have a new MoRef generated for it. If you merely reconfigure the jobs to point to the new vCenter, Veeam will see new IDs and therefore think they are brand new VMs even though they’re actually the same. Veeam has address this challenge specifically in a [KB](https://www.veeam.com/kb2136), but you’ll want to understand what will happen in this case and how your monitoring or replication applications will behave. Between points #6 and #10 here are the biggest and most complex things to investigate and can make or break if a migration is right for you. Anything and everything that talks to or through vCenter Server must be accounted for, documented, and investigated.

## Resources and Links

I’ve covered lots of different material and provided several links, but I want to list the most important ones you can use as reference material when deciding on an upgrade path. Let these links be your guiding star and read them thoroughly and carefully. While several are for vSphere 6.5, they are generic documents that are updated with each major release.

Also included are release notes to the latest versions of vSphere as of the time of writing. Something that people rarely do is read release notes and instead plunge head first into an upgrade/migration. I can’t stress enough the importance of reading and then re-reading release notes. Bookmark them and check back frequently when planning your path because VMware always updates them as new issues are discovered and workarounds found.

* [VMware Compatibility Guide](https://www.vmware.com/resources/compatibility/search.php)
* [VMware Product Interoperability Matrices](https://www.vmware.com/resources/compatibility/sim/interop_matrix.php)
* [Update sequence for vSphere 6.5](https://kb.vmware.com/s/article/2147289)
* [vSphere 6.5 Upgrade Documentation](https://docs.vmware.com/en/VMware-vSphere/6.5/com.vmware.vsphere.upgrade.doc/GUID-18B7B4BB-C24A-49CD-AE76-13285157B29F.html)
* [Best practices for upgrading to vCenter Server 6.5](https://kb.vmware.com/s/article/2147686)
* [vCenter 6.5 U1 Release Notes](https://docs.vmware.com/en/VMware-vSphere/6.5/rn/vsphere-vcenter-server-651-release-notes.html)
* [ESXi 6.5 U1 Release Notes](https://docs.vmware.com/en/VMware-vSphere/6.5/rn/vsphere-esxi-651-release-notes.html)
