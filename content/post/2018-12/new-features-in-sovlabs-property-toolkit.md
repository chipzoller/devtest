---
title: "New Features in Sovlabs Property Toolkit: Entity Assignment"
date: 2018-12-05
description: "New features in SovLabs Property Toolkit: Entity Assignment"
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2018-12/new-features-in-sovlabs-property-toolkit/featured.jpg"
categories:
  - Technology
tags:
  - vra
  - sovlabs
---

It’s no secret that I’ve been a huge proponent of the SovLabs Property Toolkit module. So much so that my new motto is, “don’t leave home without it.” I’ve written fairly extensively about some of its power in articles here and here, but today I’m really excited. No, SUPER excited because the guys and gals at SovLabs have just added a whole bunch of new features that make this indispensable to anyone running vRA. And even if you don’t own SovLabs modules for integration with third-party systems, the latest updates to Property Toolkit are so compelling that literally anyone will see massive value added to their vRA with it. Let me show you this awesomeness up close.

After upgrading to 2018.3, you’ll see a couple of new catalog items pushed out by the Configuration workflow.

![Property Toolkit Data Collection](/images/2018-12/new-features-in-sovlabs-property-toolkit/image1.png)

![Entity Property Assignment](/images/2018-12/new-features-in-sovlabs-property-toolkit/image2.png)

I want to focus on the Entity Property Assignment and Reporting catalog item here. Request the catalog item and check the dropdown.

![Entity assignment types](/images/2018-12/new-features-in-sovlabs-property-toolkit/image3.png)

This new catalog item will let you manage custom property assignment ANYWHERE across vRA’s estate—and not just SovLabs stuff either, but truly any custom property. You can perform any type of add, update, or delete on things like blueprints, endpoints, reservations, business groups, etc. Any place in vRA that is capable of having custom properties assigned to it you can automate with this new functionality. Let’s give this a spin.

Let’s say you needed to add a custom property to all, or even just a large chunk of your blueprints. Normally, you’d have to go to each one, open the portion you wanted, go to the appropriate tab, add the custom property name and value, save it, and repeat. Well, those days are done with this tool. Now, you just select the type you want, set your values, and choose from a multi-select picker what vRA entities you want to assign that on. For example, I have some new blueprints that I want to enable the guest agent on. I also don’t know where that property exists throughout vRA and on what entity types. We can solve both of those now extremely quickly and easily. Choose Custom Property from the Type dropdown.

![Entity assignment request](/images/2018-12/new-features-in-sovlabs-property-toolkit/image4.png)

I’m going to look for `VirtualMachine.Admin.UseGuestAgent` and find out where it has been set to `True`. I’ll put this property name in and select that value. Click Next.

On the reporting tab, if you care to see where all this exists, choose “Generate Report”.

![Entity assignment reporting](/images/2018-12/new-features-in-sovlabs-property-toolkit/image5.png)

Awesome! I didn’t have to scour the lands to find where that exists. Apparently, I have it on three blueprints assigned to the machine components (the tilde (~) shows child objects inside the parent blueprint, the vSphere machines in this case). It also exists inside two property groups. That saved me lots of time right there. Let’s move on and assign it. Choose Skip back at the top and click next to go on to the Management tab.

![Entity assignment request types](/images/2018-12/new-features-in-sovlabs-property-toolkit/image6.png)

Once we’re here and we choose Add for the operation type, open the vRA Entity box. Look where we can assign this! It’s anywhere! Let me select Blueprints because that’s where it needs to go, but you can see that everything that can accept custom properties is represented here.

I’ll find the blueprints to which I need this property added. Use the Name Filter to reduce the scope of your search keeping in mind that this will show blueprints and their machine components.

![Blueprint selection for property assignment](/images/2018-12/new-features-in-sovlabs-property-toolkit/image7.png)

Once I’ve moved all the blueprints I want over to the right, I check the box and click Submit.

After the request completes, go check those blueprints to double-check if you’re in disbelief that this would ever work :)

Here’s my Oracle one I added to the list:

![Custom property assigned to blueprint](/images/2018-12/new-features-in-sovlabs-property-toolkit/image8.png)

And, bam, just like that, the property has been assigned. Now, just think what if you had dozens or hundreds of blueprints and you needed to manage custom properties on them all. What about tons of reservations? Have lots of business groups, too? Can you see how much time this can save you? It’s incredible, really. I’m super excited about sharing this as you can see, and part of the reason is that I’ve designed and built CMPs for customers where the custom property assignment and management process has quite literally taken hours when summed up. This tool shrinks that process down to seconds, or just minutes. And, best of all, there is NO custom code, NO vRO work, and NO maintenance on your part. All the heavy lifting and complexity is shifted away from you and into the background.

This one is a game changer here, folks, and I’ve only scratched the surface of the functions now available in Property Toolkit. Check back later as I cover some of the other goodies inside.
