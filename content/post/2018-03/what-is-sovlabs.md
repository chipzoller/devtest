---
title: "What is Sovlabs?"
date: 2018-03-18
description: "Explanation of the SovLabs integration for vRealize Automation."
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2018-03/what-is-sovlabs/featured.jpg"
categories:
  - Technology
tags:
  - vra
  - vro
  - vrealize
  - sovlabs
---

I realized that although I have covered several of the SovLabs modules already with some fine use cases, I might have jumped the gun a little and not fully explained what this SovLabs business is and how I got to those points. I often receive the question “is it a vRO plug-in?” and so realize a little introduction is in order. To answer that question, the answer is Yes* but also No*. The asterisks are quite necessary in order to provide a fair answer because, yes, while it’s a vRO plug-in it is far, far more than that and goes way beyond any other vRO plug-in. It’s also No because it is a vRA plug-in as well. If you’re confused and want to finally discover for yourself what the heck this thing is, then this article is for you so read on for the answer, because today we’re going to show how SovLabs works from absolute scratch starting with a clean vRealize Automation platform.

Back to the question of whether SovLabs is merely a vRO plug-in, the clear answer is yes and no. It is true that SovLabs comes packaged as a vRO plug-in (in fact, the largest plug-in ever for vRO at over 100 MB for the 2018.1 release) in the VMOAPP format. Note that this is **not** a vRO package. This is a true plug-in that contains compiled Java code and not simply a tinker’s toolkit filled with a few actions and workflows. It’s hardcore stuff.

![SovLabs 2018.1.1.2 plug-in for vRO](/images/2018-03/what-is-sovlabs/image1.png)

This is the sole artifact that is needed and it gets installed inside vRO. However, it is actually a vRA plug-in because of how it interfaces with vRA without any intervention on your side (minus an initial configuration workflow). And, actually, if you were to go to the [Solution Exchange](https://marketplace.vmware.com/vsx/), you wouldn’t even find SovLabs under the [vRealize Orchestrator category](https://marketplace.vmware.com/vsx/?product=3458,1896,1895,1894,1893,1892,1891,1890,1889). Instead, all their modules are found under the [vRealize Automation category](https://marketplace.vmware.com/vsx/?product=2077,2076,2075,2072) and for good reason as you’ll soon see. So, “yes,” it is a vRO plug-in and “yes” it is a vRA plug-in. To see exactly what I mean, I’m going to go through the entire process of installing and setting up the SovLabs plug-in from a brand new, pristine install of vRealize Automation so you can understand why this designation is true.

Right, so I just installed a fresh vRA 7.3.1 system consisting of a single appliance and a single Windows IaaS server. This is all we need for the minimal installation footprint. I’ve only done two things after the installer wizard completed: created one single tenant (called “demo”) and prep the internal vRO system for the installation of the SovLabs plug-in. There is actually a script prepared by SovLabs and available on their documentation page here which performs this task for you. It does a few things to vRO:

* Sets up krb5.conf to allow Kerberos authentication
* Allows access to local processes
* Configures js-io-rights.conf
* Increases Java heap size of Control Center

The last bullet there is probably the most important as without increasing the heap size of Control Center, the plug-in—owing to its size—will not upload successfully. And, departing for a moment, on the matter of its size, I also get the question “why is this thing so big?” Not only does this one plug-in file contain dozens of different modules (i.e., [everything you see on their website](http://docs.sovlabs.com/vRA7x/2018.1.x/)) but it encapsulates a number of different SDKs so SovLabs is entirely self-sufficient. Other than the vRA plug-ins built into vRO, it relies upon no other plug-ins to function. In this regard it is many, many plug-ins rolled into one. Even things like vCenter, mail, and other more core bits of functionality, it depends on nothing else to ensure the utmost of stability. Because they can “own” these SDKs, there isn’t risk or fear that upgrading the vRO-provided vCenter plug-in, for example, will break all your SovLabs integrations, and that’s a very important thing to ensure.

Now that we have a basic tenant in vRA and we have prepped vRO, it’s time to install the plug-in. Head over to the Control Center (you must start the `vco-configurator` service on the appliance first) and go to Manage Plug-Ins. Browse and find the SovLabs plug-in.

![Install plug-in in vRO](/images/2018-03/what-is-sovlabs/image2.png)

Install the plug-in and restart the vRO services over on the Startup Options page. It’ll take several minutes for the server to recover because this is one big boy. Once it shows the running state is good, go back and make sure you see the plug-in listed.

![Installed plug-in](/images/2018-03/what-is-sovlabs/image3.png)

Now, if we’ve got that set up, it’s time to login to vRO which, for many, is the only time they’ll ever have to login again regardless of how many changes they want to make or new modules they want to use.

![vRO login screen](/images/2018-03/what-is-sovlabs/image4.png)

If we flip over to the Workflows menu, we should see a new SovLabs folder with all the various things it imported. It’s quite a huge list as you can see.

![SovLabs workflows in inventory](/images/2018-03/what-is-sovlabs/image5.png)

Although there is only one thing to run from the SovLabs side, there are two others that serve as prerequisites for doing so, and that is to add the vRA host and the vRA IaaS host into the configuration. These steps are required regardless, so you’d have to do them anyway.

![Two worklows to run as prerequisites](/images/2018-03/what-is-sovlabs/image6.png)

I’ll spare the additional walk-through of these simple workflows as they can be found in numerous other blogs and articles. But, suffice to say, they’re very straightforward and ran without incident.

![Two worklows completed successfully](/images/2018-03/what-is-sovlabs/image7.png)

I’ll expand the trees under the Inventory option just to make sure I can see things in the system after running those two workflows.

![Inventory trees populated](/images/2018-03/what-is-sovlabs/image8.png)

Now I’ve got that, it’s time to run the sole SovLabs configuration workflow. Before doing so, I want to again stress the fact that I have done *zero* configuration inside of vRA aside from creating a bare-bones tenant called “demo” and giving it one business group. I have no catalog items, no entitlements, and no blueprints (“Azure machine” comes with vRA).

![No catalog items](/images/2018-03/what-is-sovlabs/image9.png)

![No XaaS blueprints](/images/2018-03/what-is-sovlabs/image10.png)

![No entitlements](/images/2018-03/what-is-sovlabs/image11.png)

Let’s run this SovLabs configuration workflow now.

![SovLabs configuration workflow](/images/2018-03/what-is-sovlabs/image12.png)

Start the workflow, and let’s fill out the few screens.

![SovLabs configuration workflow presentation, EULA](/images/2018-03/what-is-sovlabs/image13.png)

Accept the license agreement (per always) and click Next.

![SovLabs configuration workflow presentation, Service and Content](/images/2018-03/what-is-sovlabs/image14.png)

The vRA Tenant Name up top comes from the vRA config workflow we ran earlier, and we see the one and only business group I created in the second field there. Yes, we want to create the vRA Catalog Service, and we need to give it a group (which must already be synched) in order to create the entitlement. I’ve provided it my vCAC Admins group here, which I pulled in from my AD environment. And Yes we want to publish the license content. Click Next.

![SovLabs configuration workflow presentation, Upgrade options](/images/2018-03/what-is-sovlabs/image15.png)

This is a new install so no upgrading of content is necessary, however if you did upgrade your plug-in, this is what you’d re-run and choose “Yes” here.

![SovLabs configuration workflow presentation, Install/Update](/images/2018-03/what-is-sovlabs/image16.png)

Defaults to Yes but we do want to install the workflow (EBS) subscriptions. Click Submit and watch it run through its stuff.

I actually made an error and said my group was “vCACAdmins@zoller.com” which it wasn’t. The actual group was “vraadmins@zoller.com” so I had to go back and fix that. Woops! But I want to be absolutely transparent about every single step in this process, so I have not edited out my boo-boo. I’ve redacted nothing in this process, including my errors, so you can truly see everything involved in going from zero to SovLabs.

![SovLabs configuration workflow presentation, Service and Content take two](/images/2018-03/what-is-sovlabs/image17.png)

But after fixing that security group, the workflow ran right through.

![SovLabs configuration workflow in progress](/images/2018-03/what-is-sovlabs/image18.png)

![SovLabs configuration workflow token failure](/images/2018-03/what-is-sovlabs/image19.png)

Now, that’s better :). Let me go into the catalog to see what happened.

![New Add License catalog item appears](/images/2018-03/what-is-sovlabs/image20.png)

Whoa, what is this??

The SovLabs plug-in created this automagically! If I go back and check those places in vRA that were previously empty, I now see stuff is there.

![New catalog items](/images/2018-03/what-is-sovlabs/image21.png)

![New XaaS blueprints](/images/2018-03/what-is-sovlabs/image22.png)

![New entitlements](/images/2018-03/what-is-sovlabs/image23.png)

And, again, all this created by the plug-in as the result of that one configuration workflow.

Ok, so now we have the ability to add a license. Where is the rest of the stuff?? “So far this isn’t very exciting,” I know you’re saying. Let’s add my license and see what happens next.

![Pasting in SovLabs license](/images/2018-03/what-is-sovlabs/image24.png)

![Submit license request](/images/2018-03/what-is-sovlabs/image25.png)

![Licensing request submitted](/images/2018-03/what-is-sovlabs/image26.png)

If I flip over to the vRO client and expand License -> vRA ASD, I see it running through the Add License workflow.

![Licensing workflow in progress](/images/2018-03/what-is-sovlabs/image27.png)

Hmm, publish content? Interesting. Depending on what modules your license entitles you to use, this could be a quick or very long wait. Lots of complexity is happening behind the scenes, so be patient.

After about 7 minutes (because I have everything licensed), it completes.

![Licensing workflow token complete](/images/2018-03/what-is-sovlabs/image28.png)

Now, go back to the vRA catalog and have your mind blown away.

![Service catalog full of items](/images/2018-03/what-is-sovlabs/image29.png)

WHOOOAAA. What the?? To employ some good ol’ Monty Python:

![What is this sorcery?](/images/2018-03/what-is-sovlabs/image30.jpeg)

The plug-in decoded the license, found which modules were entitled, and published only that content for you, automatically, to the vRA catalog. If you now pause to take a tour through vRA, you’ll see a whole host of accompanying things like XaaS resource actions and mappings to facilitate these new things. How about check out the Subscriptions portion of vRA?

![New subscriptions created](/images/2018-03/what-is-sovlabs/image31.png)

That’s TWO PAGES’ worth of brand new event broker subscriptions which you *didn’t* have to create yourself. And, remember, all we’ve done in this case is run a single vRO workflow. Everything else is self-published beginning with the Add License catalog item. This isn’t something a vRO plug-in does, which is why SovLabs isn’t just a vRO plug-in. It pushes things **into** vRA based on how you configure it. There is nothing you need to monkey with inside vRO, and nothing outside of the catalog in vRA. Everything from soup to nuts is instantiated and configured for you based on simple, easy-to-use catalog items.

Folks, let me just be honest for a second, this is amazing. The fact that it does all the heavy lifting for you is remarkable. If you’ve ever tried to interface a regular vRO plug-in with vRA to actually get it to do stuff, you’d find it’s not a very quick or fun process and is fraught with peril and creates copious opportunity for human error. All of that is done for you with SovLabs. I really hate to use the term “game changing” because I feel it’s often employed to create artificial sales and marketing hype, but in this case it couldn’t be more appropriate. When you enable someone with absolutely zero vRO experience and minimal vRA experience to extend their own CMP out to other infrastructure in very advanced ways and in a simple fashion, you change the game of extensibility entirely.

From this point, you can begin to configure and then consume the modules according to your extensibility needs. So, for example, if we wanted to configure Custom Naming (the most popular module and is amazingly flexible), we are now poised to do so. This process is shown quite well in Dailyhypervisor’s blog post [here](https://dailyhypervisor.com/vra-7-3-configuring-sovlabs-custom-naming-module/) and in my article [here](/post/2017-10/custom-naming-in-vra-with-zero-custom-coding/). At the end, once both configuration catalog items are requested and run, out pops a Property Group which, again, is an entirely automated process and can be attached to a blueprint of your choosing. Rinse and repeat with other modules. You’re now up and running with SovLabs!

I hope I’ve now finally answered the question “what is SovLabs?” And I hope that at this point you understand the answer that it is far more than just a vRO plug-in. It is, in fact, a vRA plug-in which is unmatched by anything else out there in the marketplace. You run one configuration workflow, and the rest is entirely driven by vRA. There may never be the need to return to vRO again after that point, and that’s not something you can say for any other plug-in in existence. Go forth and extend vRA to your heart’s content!
