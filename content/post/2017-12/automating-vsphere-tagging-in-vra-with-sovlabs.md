---
title: "Automating vSphere Tagging in vRA with SovLabs"
date: 2017-12-31
description: "Using SovLabs vSphere Tagging module to automate tag assignment through vRealize Automation."
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2017-12/automating-vsphere-tagging-in-vra-with-sovlabs/featured.jpg"
categories:
  - Technology
tags:
  - sovlabs
  - vra
  - vrealize
---

vRealize Automation is a very metadata-driven system through capabilities called custom properties. These properties—which are nothing more than key-value pairs—can be applied at multiple levels throughout vRA and cause it to behave in different ways. The same sort of metadata drives a lot of decision within vSphere which are external to vRA. But applying these tags at a vSphere level has been somewhat of a challenge in the past when driven through vRA because there is no out-of-the-box support for vSphere tags. vSphere tags are useful in a whole variety of ways. Some examples include attaching descriptive labels to objects that identify ownership, application, or customer. Others include things like identifying backup jobs and policies around which they’re based. Being able to incorporate these vSphere tags into vRA can therefore be very important and something I see more and more customers adopting within vSphere and looking to harness in vRA. Recently, the SovLabs group have taken up the yoke and produced a vSphere Tagging module for vRA which allows super simple assignment of those vSphere tags that involves no custom vRO code or mucking around with fragile plug-ins of any sort. So in this article, I’m going to illustrate how this module can be leveraged to apply vSphere tags through vRA and the power and flexibility afforded you in doing so.

Unlike a lot of the SovLabs functionality which are easily configured through XaaS Catalog items like adding an Active Directory configuration or a Satellite configuration shown below, the vSphere tagging utility is really driven through custom properties (like all of SovLabs’ modules) and doesn’t require configuration. The only thing necessary to get started is a vCenter endpoint.

After selecting the catalog item, we need to provide information on the vCenter Server endpoint where tagging will be applied. Why not just configure the vRO vCenter plug-in, you ask? A moment of departure is necessary at this juncture.

![Add SovLabs vCenter Endpoint catalog item](/images/2017-12/automating-vsphere-tagging-in-vra-with-sovlabs/image3.png)

This endpoint is created internally to the SovLabs configuration and in no way relies upon the pre-existing vRO vCenter plug-in. That’s a convenient thing because to do vSphere tagging without SovLabs requires configuring the vCenter plug-in, configuring vAPI plug-in, and then patching together workflows on your own. Not exactly simple and elegant. One of the great things the SovLabs team has done when designing and building their solutions is that they embed the entire Java SDK for vSphere within their own plug-in (hence the size). This has the benefit of zero reliance upon any other vRO plug-ins allowing them to “own” the configuration and connection from start to finish. So, essentially, when configuring this vCenter endpoint requested through the catalog, you’re enabling an internal connection that is self-contained.

Anyhow, configure the vCenter endpoint with the requested fields. I’m using an embedded PSC model so I’ll check the box. And if you want to save this credential for later use, check that box as well.

![SovLabs vCenter Endpoint request form](/images/2017-12/automating-vsphere-tagging-in-vra-with-sovlabs/image4.png)

Once that request completes successfully, you’re ready to roll! Time to create some tags.

The tagging functionality, as mentioned earlier, is entirely driven through the presence of custom properties on attached items within vRA. The module will watch for a custom property with a specific name and, if that name is present, it will attempt to assign tags based on its value.

The magic custom property that enables tagging is called `SovLabs_CreateTags_VMW_<something>`. The `<something>` part can literally be anything you wish and is only a descriptor to aid you in your organization. The value of this property is the tagging information itself which can be specified in a number of ways and includes the tag name, category name, and other properties. To show how easily it can be to assign an existing tag called “Infrastructure” which belongs to the category “Department”, we create the following custom property on a machine in our blueprint.

```sh
SovLabs_CreateTags_VMW_MyTest  [“Infrastructure” , “Department”]
```

![Custom properties tab](/images/2017-12/automating-vsphere-tagging-in-vra-with-sovlabs/image5.png)

Submit the request, wait for it to complete, then check the resulting VM. You’d get the following.

![vSphere tags assigned to VM](/images/2017-12/automating-vsphere-tagging-in-vra-with-sovlabs/image6.png)

Boom. It’s that simple. The presence of the “magic” custom property name invokes the tagging functionality, and the value of that property has information on the tag(s) to be applied. Nothing else you need to do.

What if you want to assign multiple tags in one go? No problem, there are a couple ways. You could create multiple custom properties each beginning with the necessary prefix. You could create a property group and put those properties within it. Or you can just use the one custom property and add multiple entries within the same value like this:

```sh
[[“Infrastructure” , “Department”], [“Oracle” , “Application”]]
```

I’m using an array of arrays here, but the SovLabs engine allows several different ways to pass in the values as described in the [docs](http://docs.sovlabs.com/vRA7x/current.html) including JSON. But again, pretty simple, right? The SovLabs tagging module also allows you to create both tags and categories and assign them. How do you do that? Simple. Just like you assign tags. If the tag or the category is not found, it automatically creates it for you, then assigns it. In the above example, if Infrastructure/Department had existed and the tag group “Application” existed but not the tag of “Oracle”, then the module would know to create “Oracle” for you. You can even set the description for that tag in the value for your custom property. And when creating a tag category, you can also set the cardinality of that category right through the module as either single or multiple with a simple true/false in your value.

![vSphere tag category creation](/images/2017-12/automating-vsphere-tagging-in-vra-with-sovlabs/image7.png)

Hopefully by now you’ve seen and understand how simple vSphere tagging can be with the SovLabs module, but that’s only the beginning as far as the flexibility it allows. Because everything in SovLabs uses a [template engine](http://docs.sovlabs.com/framework/sovlabs-template-engine.html) and the behavior is essentially controlled by custom properties, you have a lot of power at your fingertips for creating vSphere tags.

Let’s say you need to assign a tag to every VM that results from a given business group, but you have multiple business groups and multiple blueprints, so you can’t hardcode custom properties at the blueprint level. That’s no problem. We can set the value of the property that creates tags to be an external custom property. For example, I can create a custom property on the business group level called `SovLabs.Tagging.Department` and provide it the value of `Infrastructure`.

![Custom property assigned](/images/2017-12/automating-vsphere-tagging-in-vra-with-sovlabs/image8.png)

I want every blueprint that comes out of this business group to get the tag called “Infrastructure”. So in my blueprint, I can create the following custom property that is for universal tagging by business group like so.

```sh
SovLabs_CreateTags_VMW_BusGroup  [“{{SovLabs.Tagging.Department}}” , “Department”]
```

![Custom property assigned to create tags](/images/2017-12/automating-vsphere-tagging-in-vra-with-sovlabs/image9.png)

Each time this blueprint is provisioned, it pulls whatever the value is at runtime for `SovLabs.Tagging.Department` and sets that as the name of the tag found within the tag category called “Department”. The end result is that, for this deployment, I still get a tag named “Infrastructure” assigned to the VM.

This functionality coupled with the ability to template everything in SovLabs makes it extremely flexible and powerful capable of solving almost any use case when it comes to tag assignment. So not only is setup super simple and doesn’t require you to mess with vRO plug-ins in any way, but configuration is equally simple through a combination of a single vRA catalog request and custom property assignment. It’s up to you to think of the possibilities of how you can now use vSphere tagging in a very streamlined and flexible way. I hope you’ve found this useful, now the only thing left is to go forth and tag to your heart’s delight!
