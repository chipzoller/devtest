---
title: "Making vRA Email Easy with Custom Notifications"
date: 2018-03-21
description: "Using SovLabs Custom Notifications to simplify vRA emails."
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2018-03/making-vra-email-easy-with-custom-notifications/featured.jpg"
categories:
  - Technology
tags:
  - vra
  - vrealize
  - sovlabs
---

Email is one of those things that most of us take for granted these days. We just expect email works, that it is flexible, and that it’s adaptable to our situation. Within vRA, we can also get email in and out based on a variety of scenarios. But when it comes to customizing how that looks and works, it’s a little tricky. As a result, many folks don’t even bother mucking around with it because of how complex it is what with manually uploading new email templates to the appliance, restarting services, customizing XML files, or writing vRO code and event broker subscriptions and doing all the plumbing work yourself. But thanks to the godsend that is [SovLabs’](https://sovlabs.com/) [Custom Notifications module](https://sovlabs.com/products/notifications-vra-module/), all this is now a thing of the past. It not only makes it super simple to create your own custom notifications, but it’s actually kind of fun to see how quickly and easily you can give your CMP that extra edge with rich emails that can be your own HTML, include whatever custom properties you want, and go to basically anyone you want. In this article, I want to bring this module to attention and show you exactly how you can use it to extend your vRealize Automation platform to send custom email notifications to recipients of your choosing.

In order to get email out of vRA for basic things like knowing if your provisioning request was successful, you need to setup a few things. First, there’s the outbound email server (Administration -> Notifications -> Email Server) so that you can connect the appliance to the mail relay. Next, there’s ensuring you have the scenarios you wish activated (Administration -> Notifications -> Scenarios) of which there are a whole host. And there’s also ensuring the email address is present in your Active Directory user profile.

![Chip Zoller AD user object](/images/2018-03/making-vra-email-easy-with-custom-notifications/image1.png)

Once you have all this, you should begin receiving some mail. But when you do, it comes to you only, and it’s just kind of bland.

![vRA stock email body](/images/2018-03/making-vra-email-easy-with-custom-notifications/image2.png)

You can see all of the basic information, but you don’t have any extra metadata that’s in the request (I have a couple in this catalog item) and also what if you need this to go to an operations team instead of yourself? It’s not really possible without some heavy lifting and running around. Changing what you see above in vRA is not a trivial task although there are some templates available that can assist. The latter use case of sending email upon provision and destruction to arbitrary recipients is even trickier with only some community code out there in vRO. This approach requires much more massaging.

Now, let’s see how to accomplish this using the SovLabs Custom Notifications module. What’s nice about this and other SovLabs functionality is that you never have to leave the comforts of your vRA portal, never have to write and manipulate your own JavaScript, and never have to monkey with system files and services.

In this scenario, we will configure notifications to send successful build and destroy emails to an operations team so they can be notified and make the appropriate changes to external systems of record. First, we add a Notifications Configuration through a simple catalog item which was published automatically for you when you added the license.

![Add Notification Configuration catalog item](/images/2018-03/making-vra-email-easy-with-custom-notifications/image3.png)

There’s a form we must fill out with all the conveniences you might expect, including which types of events we want to get (VMLIFECYCLE contains the provisioning aspects), but there are others including snapshot notifications and IPAM. We choose the states we want with simple check boxes. Then, we choose standard things like title and body. Oh, and as you can see, the HTML is already pre-built for you making it easy to copy and paste whatever you like!

![Add Notification Configuration request form, page 1](/images/2018-03/making-vra-email-easy-with-custom-notifications/image4.png)

Over on the Message Server Configuration tab, we can use an existing mail server definition as well as an existing email group definition. Let’s create a new one to see what’s here.

![Add Notification Configuration request form, page 2](/images/2018-03/making-vra-email-easy-with-custom-notifications/image5.png)

Everything you would expect to see, including the ability to set and save email server credentials if you enable authorization. And down on the Email Group configuration portion, here we can very easily add To, CC, and BCC addresses all in one profile! This ability makes it super simple to put whatever email(s) you like into a profile that can then be used on a per-blueprint basis if you like. Submit the configuration, check your requests to ensure it completes, and then go back to the SovLabs vRA Extensibility Modules service in the catalog. This time, select Add Notification Group.

![Add Notification Group catalog item](/images/2018-03/making-vra-email-easy-with-custom-notifications/image6.png)

Here, we’ll choose the profile we just selected giving it a label and type.

![Notification Group request form](/images/2018-03/making-vra-email-easy-with-custom-notifications/image7.png)

Once this is submitted and successful, you should now see a nifty new property group that was auto-created for you.

![vRA property groups](/images/2018-03/making-vra-email-easy-with-custom-notifications/image8.png)

If you dive into this property group, you’ll see a number of system properties in addition to the main custom property called `SovLabs_NotificationGroup` and the value of which is the profile you created in the last step.

![SovLabs_NotificationGroup property group](/images/2018-03/making-vra-email-easy-with-custom-notifications/image9.png)

The SovLabs Notification module essentially checks to see if this property exists and, when it does, it matches the profile to the value and uses that to know what, where, and to whom to send notifications. You can then use this property anywhere in vRA you see fit, but in this demonstration we’ll consume this property group simply by attaching it to a blueprint.

In this blueprint, all I’ve done is found and attached this pre-created property group, then saved the blueprint. It’s really that simple and I’ve done absolutely nothing else.

![vRA blueprint properties](/images/2018-03/making-vra-email-easy-with-custom-notifications/image10.png)

Now, I’ll go to the catalog and request this item to see what happens.

![vRA test catalog item](/images/2018-03/making-vra-email-easy-with-custom-notifications/image11.png)

![vRA test catalog item request form](/images/2018-03/making-vra-email-easy-with-custom-notifications/image12.png)

You can see I have a couple of custom fields in the request. More on this in a second.

![Click submit](/images/2018-03/making-vra-email-easy-with-custom-notifications/image13.png)

After the request succeeds, I check my email and find this.

![SovLabs custom notification email body](/images/2018-03/making-vra-email-easy-with-custom-notifications/image14.png)

And, bam, there it is! What you see is an HTML-formatted email that comes entirely out-of-the-box. It’s important to stress that what you see above is stock and I’ve made absolutely no modifications whatsoever to the body of the message. It’s pretty detailed already, right? And easy to read? Certainly. They’ve done a great job of putting this together, but also in making it easy to extend into whatever you’d like to see.

Now that we have a basic email, how do we customize this easily to add additional things like custom properties that I had on the request form? If you scroll up, you’ll see I had a drop-down called `CZAD.Users`. I supplied a value for this field at request time. I now want to see that in my email that came across. Maybe this is something like an application owner or backup retention policy or other metadata to go into an asset tracking system. Whatever it may be, it’s simple to drop into these custom notifications. So let’s see that process.

From your Items tab, go over to SovLabs Notification and find this profile you created earlier. We need to edit the body of it. Open the item and click the Update action item.

![Notification Configuration day-2 actions](/images/2018-03/making-vra-email-easy-with-custom-notifications/image15.png)

The body as well as the other fields become editable.

![Notification Configuration body](/images/2018-03/making-vra-email-easy-with-custom-notifications/image16.png)

You have the choice of either editing it as-is here in the text area, or lifting it into an HTML editor of your choice. I’m going to choose the latter because I’m not a hardcore HTML programmer. I’ll just jump over to a [simple online editor](https://html-online.com/editor/) for demo purposes and paste in the code.

![Raw HTML code (right); rendered HTML code (left)](/images/2018-03/making-vra-email-easy-with-custom-notifications/image17.png)

This may be a little difficult to see depending on how it gets published, but on the right I have pasted in the raw HTML, and on the left I have it rendered out.

I want to add a new row under the “Machine details” heading that shows my `CZAD.Users` custom property and its value. Now, you may notice I have a number of these words enclosed in double braces like `{{ something }}`. These are actually custom properties inside vRA that, thanks to the wonders of the SovLabs [Template Engine](http://docs.sovlabs.com/vRA7x/2018.1.x/framework/sovlabs-template-engine/tags/), we can easily pick up and translate. Yes, really, it’s as simple as enclosing whatever custom property we want in double braces and it gets automatically translated, and it can be *any* custom property as well—even system properties!

!["Engage" those templates](/images/2018-03/making-vra-email-easy-with-custom-notifications/image18.jpeg)

Maybe it’s just me, but I find that AWESOME and **waaay** better than having to write any code to pick it up and interpret it myself.

So, getting back, let’s add that line underneath “Network name” so our code and, thus, the HTML gets rendered as shown.

![Rendered HTML (left) with custom property](/images/2018-03/making-vra-email-easy-with-custom-notifications/image19.png)

Again, maybe difficult to see, but I’ve made the code change in the editor on the right (highlighted), and I can see the editions rendered on the left. Let’s copy and paste this entire block back into our notification definition and update it.

![vRA catalog request details](/images/2018-03/making-vra-email-easy-with-custom-notifications/image20.png)

That was successful, now let’s re-request the same item and see what we get.

![vRA catalog item request form with `CZAD.Users` specified](/images/2018-03/making-vra-email-easy-with-custom-notifications/image21.png)

I’ve highlighted the field and its value, so we should hopefully see this now.

![Successful request](/images/2018-03/making-vra-email-easy-with-custom-notifications/image22.png)

![SovLabs custom notification with rendered property, provisioned](/images/2018-03/making-vra-email-easy-with-custom-notifications/image23.png)

And, boom, there we go! The new email that came from the system has the custom property added and got the correct value. And, likewise, when we destroy this deployment, we get another email with the same information making it easy for an operations team to get all the info they need.

![SovLabs custom notification with rendered property, destroyed](/images/2018-03/making-vra-email-easy-with-custom-notifications/image24.png)

Now, hopefully, you can see how huge this notification module is, how vastly powerful and flexible it can make your vRA infrastructure, and, above all else, how much easier it is to setup and administer versus everything else out there. This is a great way to add value to your CMP and can solve a whole variety of use cases. Now all that’s left is to go forth and see how you can use this in your organization!
