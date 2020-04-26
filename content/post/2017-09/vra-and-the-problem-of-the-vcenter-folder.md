---
title: "vRA and The Problem of the vCenter Folder"
date: 2017-09-18
description: "Creating vCenter folders through deployments in vRealize Automation."
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2017-09/vra-and-the-problem-of-the-vcenter-folder/featured.jpg"
categories:
  - Technology
tags:
  - vra
  - vrealize
  - sovlabs
---

Between speaking with customers, architecting and deploying solutions, and helping others out with their issues on the [VMware Communities](https://communities.vmware.com/welcome) forums, I encounter a lot of problems and get a lot of info on how customers do business with their CMPs. One of the requests that keeps coming up over and over again is how to deal with putting vRA’s workloads into the correct folder structure that has already been established in an enterprise. Very often—especially in large vCenter servers—companies have an established folder structure which could be quite complex. It is not unheard of to see a tree structure ten levels deep. These folders not only serve the purpose of providing visual VM organization, but also in defining permissions, monitoring, and backup boundaries. Permissions can be assigned at those folders granting access to the responsible parties. Folders, for example with vROps, can segregate monitoring policies. And just about every backup application on the market can now use vCenter folders as their organizational concept when setting up jobs. So they tend to be very important to certain organizations in a variety of ways. When implementing a CMP it is therefore important that it be able to fit into the established folder schema.

vRealize Automation (vRA) is certainly capable of putting its VMs into folders. In fact, if you changed nothing out of the box, it deposits its deployed VMs into a default vCenter folder called “VRM”.

![Default folder created by vRA called "VRM"](/images/2017-09/vra-and-the-problem-of-the-vcenter-folder/image1.png)

For smaller shops that don’t really worry about folders, maybe this is fine. Through use of custom properties, vRA can stash those VMs into a folder of your choosing. By specifying the property `VMware.VirtualCenter.Folder`, the value of which determines the folder, any system deployed from vRA will land in that folder.

![Custom property `VMware.VirtualCenter.Folder` set to value `vRA/Systems`](/images/2017-09/vra-and-the-problem-of-the-vcenter-folder/image2.png)

Use of a forward slash (“/”) indicates a separate level in the folder tree. The above would yield the following result below.

![vSphere VMs and Templates inventory view of result](/images/2017-09/vra-and-the-problem-of-the-vcenter-folder/image3.png)

Anywhere this custom property is present within vRA that a deployment “touches” will be inherited and applied. For example, if this property were applied at the vCenter endpoint level, a VM that is deployed to that endpoint will be affected by the custom property. Likewise, if this property is present on a business group, and a user from that business group requests a machine, that machine will go into the folder specified by the custom property. What happens if this property is present twice at different locations? In that case, an order of precedence applies where the property which occurs later overrides one earlier. For example, if the property were on both a business group and specified at time of request, the value at time of request would win. While this provides some level of customization above what the VRM default folder affords, it’s still not enough for many customers. The ultimate desire is to have vRA deposit systems into the exact folder given a number of variables that might include things like department, environment, geographic location, and application. That level of flexibility is just not possible in vRA today without taking to vRealize Orchestrator (vRO) and writing custom JavaScript code. Until recently, that last sentence was true, but now SovLabs has an answer that changes everything and gives you the power you need.

With the 2017.3 release of SovLabs Extensibility Modules for vRA comes a new module called the SovLabs [Property Toolkit for vRealize Automation](https://sovlabs.com/products/sovlabs-property-toolkit-vra-module/). This module has two main abilities. The first is to change and manage custom properties on systems after they have been deployed.  This is extremely powerful, as this kind of functionality does not exist natively in vRA and requires custom vRO workflows and code today.  The second capability, the subject of this blog and the answer to our prayers, is to create dynamic property sets or groups of properties. With dynamic property sets, each property within the set can derive its name and value based on the value of other vRA custom properties or any custom logic utilizing the SovLabs Template Engine. With a dynamic property set, you can now derive a value for `VMware.VirtualCenter.Folder` from VM properties, including user-input values at request time. Let’s dig in and see this in action.

Imagine the following scenario, which I’ve taken from a real customer setup but made my own alterations:  Your organization is very strict in its vCenter configurations. With over 4,000 virtual machines, you have to be organized. Further, with multiple locations, multiple lines of business, multiple environments, and even more applications, things get downright dirty if they aren’t carefully organized. This is the folder organization we must achieve.

![Multi-level folder hierarchy](/images/2017-09/vra-and-the-problem-of-the-vcenter-folder/image4.png)

Backup jobs are organized by these folders with specific retention policies applied due to regulatory compliance requirements. And your operations team allows access to these applications from the app teams themselves, which means you can’t give open access to everything in vCenter. This scenario is very real for many organizations. Let’s see how the SovLabs Property Toolkit module can easily handle this type of structure.

As shown above, we have a 5-level folder hierarchy in which we want vRA to stash machines that result from deployments. There are multiple options at each of these levels. For example, let’s start and assume we have the following specific structure:  Southeast -> Inside -> Sales -> Production -> Oracle. We need to create labels for each of these levels and put them around vRA for the module to consume. The reason is simple:  vRA services multiple regions, groups, departments, environments, and applications, and we must be able to distinguish between, say, Oracle and Sharepoint for each combination thereof. We’ll create custom properties for each of these levels in the hierarchy and apply them to the relevant constructs within vRA. This is a table of the custom properties I’ve created, their value, and where they reside.

| Property Name         | Value        | Cons                        |
|-----------------------|--------------|-----------------------------|
| VCFolder.Region       | Southeast    | Cluster Compute Resource    |
| VCFolder.BusGroupDept | Inside/Sales | Business Group              |
| VCFolder.Environment  | Production   | Cluster Compute Resource    |
| VCFolder.Application  | Oracle       | Blueprint (show in request) |

The cluster (of which there is only one since this is a lab) has the Region and Environment properties, but imagine that we had multiple clusters, one for production and another for non-production. Those properties would then be split up. We’ve created a business group called “Inside – Sales”. There are others that begin with “Inside” but might be “Engineering” or something similar. The names are effectively two components of our folder naming plan. Lastly, the application is defined in our property dictionary and presents as a drop-down list of application names. This property has been added to our blueprint and is being shown to users in the request form. The reason being that, in this scenario, we’re only deploying IaaS and not PaaS, so applications have yet to be installed.

Now comes the magic. We have our property names established and configured. It’s time to configure the integration. For this, we must create a new custom property beginning with `SovLabs_CreateProperties_`. This prefix is required and is how the module knows to invoke the action defined in its value. In this case, I’ve created `SovLabs_CreateProperties_VCFolder`. I’ve done this directly on a test blueprint we’ll deploy in just a minute. The value is the most important part as it is JSON describing how the `VMware.VirtualCenter.Folder` property is to be constructed.

```json
{
  "name": "VMware.VirtualCenter.Folder",
  "value":"{{VCFolder.Region}}/{{VCFolder.BusGroupDept}}/{{VCFolder.Environment}}/{{VCFolder.Application}}"
}
```

With this value, we are telling it to templatize the `VMware.VirtualCenter.Folder` property from all the constituent parts it comprises. The forward slashes denote the hierarchy.

![Custom property assigned to blueprint](/images/2017-09/vra-and-the-problem-of-the-vcenter-folder/image5.png)

If we go to our catalog and select this item, we then are asked to tell it what application we want.

![Demo catalog item](/images/2017-09/vra-and-the-problem-of-the-vcenter-folder/image6.png)

![Demo catalog item request form](/images/2017-09/vra-and-the-problem-of-the-vcenter-folder/image7.png)

We submit the request and stand back for a second. Actually, let’s check vCenter and see what vRA does.

![Task list in vCenter](/images/2017-09/vra-and-the-problem-of-the-vcenter-folder/image8.png)

Ah, so we see the individual folder create tasks hit vCenter. By default, vRA will look for the value of `VMware.VirtualCenter.Folder`, and if it doesn’t exist it will create every level that is present. This shows we’re on the right track with a result.

![VM created in correct folder](/images/2017-09/vra-and-the-problem-of-the-vcenter-folder/image9.png)

Alright, that’s what we want to see! Is that not cool?! Once the machine is built, we can check the properties tab (presuming you have business group manager role assigned) and see the resulting custom properties from all over that applied to the deployment.

![`VMware.VirtualCenter.Folder` custom property set to value of all constituent properties](/images/2017-09/vra-and-the-problem-of-the-vcenter-folder/image10.png)

So as to be expected, the module gathered our custom properties from all around vRA and, based on the template we defined as the value of `SovLabs_CreateProperties_VCFolder`, patched together the `VMware.VirtualCenter.Folder` property dynamically at build time all without having to write so much as a single line of JavaScript. That’s pretty amazing and powerful functionality right there, especially keeping in mind that if another user were deploying from a separate business group, the resulting folder would be different, so entirely dynamic.

I hope this small tutorial has piqued your interest in the possibilities this module unlocks. The sky is the limit. Next time, we’ll look at another common use case for this SovLabs Property Toolkit module:  Multiple property background assignment.
