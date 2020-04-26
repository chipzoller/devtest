---
title: "Custom Naming in vRA with zero custom coding"
date: 2017-10-02
description: "Using SovLabs custom naming module for vRA."
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/featured.jpg"
categories:
  - Technology
tags:
  - vra
  - sovlabs
  - vrealize
---

Everyone’s got one, everyone needs them, and most people struggle with them. I’m talking about custom machine names, of course. Just like organizations themselves, naming schemes can be, and are about, as varied as possible. Some companies have fairly straightforward names with maybe two elements while others have extremely dynamic requirements that factor in five or six elements. Whatever your naming scheme might be, anyone who has used vRealize Automation (vRA) appreciates the difficulty of getting their naming scheme out of deployed machines. Unless you raised your hand with the more straightforward example and only use a couple simple elements, you aren’t going to be able to get it from vRA out of the box. In vRA, you’re limited to “machine prefixes” which are extremely basic consisting of a name (the prefix), number of digits, and a running counter of what the next number would be. With that, you could do something like “VM001” or “Sales-01” or “vra007”. Although that’s, well, cute, it’s almost totally useless if you hope to integrate vRA into your existing naming standard. To solve this vexatious issue, some have developed ad-hoc packages in vRealize Orchestrator (vRO) that make custom names a little better while others have taken to recreating the wheel themselves, often spending weeks or months writing, testing, debugging, and operationalizing custom code only to find they need to rinse and repeat when the new version of vRA or vRO comes along. So as I hope the picture I’m painting is clear, the solutions to date have not been satisfactory to really operationalize vRA in a stable, consistent, and enterprise-ready fashion. This changed dramatically when [SovLabs](https://sovlabs.com/) entered the market with their plug-in for vRA. For the first time, there was a solution that solved many of the difficult extensibility challenges faced by organizations and solved them in a way which was consistent with their existing enterprise software experiences–that is to say, with software that is compiled, tested, maintained, updated, and, most importantly, supported by a team of developers. The solution that we’ll check out here is probably the most popular one amongst the crowd, and that is an enterprise-ready custom naming module. And, as the title of the article implies, we’ll demonstrate how you can implement a complex naming standard into your own vRA with *zero* custom code.

Custom Naming is just one of the many modules developed and delivered by SovLabs with others including things like Active Directory, DNS, IPAM, Backup-as-a-Service, and all of these from multiple vendors in the ecosystem. Basically, if you want to extend vRA to encompass it, they probably have it. Custom Naming is the one we’ll dive into today, however, but I’ll cover others in the future. This article is really intended to get you familiar with the power of custom naming and how to actually implement it inside vRA. It will assume you have already installed the plug-in in your vRO environment and licensed it appropriately.

Before we begin with the technical bits, we need to come up with a custom naming standard, and one that is realistic to your naming standard. This is what we’ll use as it’s based on a real, live enterprise customer that has datacenters all over the world with thousands of virtual machines deployed.

---

## LLLT-OEEEAAA###

---

This needs a little explanation, so have a look at the key below to understand how this is broken down.

### L = Location. Datacenter, Continent, Country, or State.
### T = Type. P(hysical), V(irtual).
### O = OS. L(inux), W(indows), E(SXi).
### E = Environment. PRO(duction), DEV(elopment), Q(uality)A(ssurance)T, T(e)ST, ST(a)G(e).
### A = Application. Various 3-character codes for any application.
### # = Sequence.

Hopefully this is self-explanatory with some of the possibilities next to the descriptor. Based on this name, an example would be LONV-LPROORA023, indicating London, Virtual, Production, Oracle, and number twenty-three in the sequence. This example name is exactly fifteen characters in length, thus able to accommodate Windows’ naming limitations. Also, it’s worth pointing out that the 023 at the end is specific to the combination that precedes it. That is to say that it is the 23rd system that corresponds to that precise name combination, and each different combination has its own set of running sequence numbers.

![Naming flow map](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/image1.png)

So, a name like LONV-LPRO**NGX** would have its own separate sequence that is maintained strictly for that combination. As you can see, this six-element name is rather complex yet is very real for some organizations. Let’s go on and see how simple this can actually be to accomplish with SovLabs’ solution.

After getting the plug-in installed and licensed, you’ll see two new catalog items inside vRA. By the way, these are created automatically so you need to do *zero* work inside vRA to see them. Just so that’s clear, I did not so much as lift a finger here after running a single configuration workflow from inside vRO.

![Catalog items for SovLabs Custom Naming](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/image2.png)

We need to add the sequence first, then when we create the naming standard we will use that sequence as a part of it. Click on the Request button for Add Naming Sequence to pull up the request form.

![Naming sequence request form](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/image3.png)

First, thing is to give it a label. This label will be selected as a component of the naming standard, so give it a name that can easily be tied to that naming standard. I’ll call it “BlogSequence”. Next, select a sequence type. In virtually all of the cases, you’ll want to use decimal, but just in case you have a very unusual sequencing type, you can choose from hex, octal, or even a pattern consisting of a mix of bases and static text. The checkbox to reuse sequence values is for when a machine is destroyed that has a given sequence and you wish to reuse that in a new machine build. Max sequence length, the number of digits involved, three in our example case. Initial value, usually 1. Sequence padding are left-aligned numbers or characters to reach the value, so if your sequence length is three and you start with 1, then setting sequence padding to 0 gives your first machine a sequence of 001. Lastly, the unique key. This requires a bit of an explanation. I talked a bit earlier how we have a specific combination of naming elements that we need to maintain, and I used the examples LONV-LPROORA and LONV-LPRONGX to illustrate this. The unique key is that combination which precedes the sequence number. SovLabs uses a unique [template engine](http://docs.sovlabs.com/framework/sovlabs-template-engine.html) to accomplish the work behind the scenes. We need to specify these name elements enclosed in double braces. Type the following below in the unique key window:

## **{{Location}}{{Type}}{{OS}}{{Environment}}{{Application}}**

“What about the dash? Why do I need to type this stuff, and what does it mean? I’m lost!” Stay with me, all will become clear shortly.

Go back to the catalog and request the Add Naming Standard catalog item.

![Naming standard request form with template](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/image4.png)

Give it a name, choose the naming sequence that we created earlier, and then complete the template. Now, similar to the Unique Key field in the naming sequence, the Template uses the same labels in double braces, only this time we have to format it exactly how we want our name to be formed. So you can see I have added a dash (-) between {{Type}} and {{OS}}. If you refer to our sample naming scheme at the outset, there is a dash that separates those two. So the Template here is the pattern in which the name will actually be generated and slapped on a machine whereas the Unique Key is what the module uses internally to keep track of the number sequences that get assigned. Make sense? Finally, at the end of the template, tack on BlogSequence by adding {{sequence.BlogSequence}}. All sequences must begin with the word “sequence” for the template to be valid. Submit the request and watch it complete.

![Requests successful for naming standard and sequence](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/image5.png)

Once this is successful, let’s see what happened in the background. Navigate t0 Administration -> Property Dictionary -> Property Groups. Notice that a new property group has been created automatically for you once the Naming Standard workflow completed successfully.

![New custom property group created](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/image6.png)

The name you see will be prefaced by your tenant, hence the word “ravel” you see above. So now we have a property group ready for use, and we put it to work by simply attaching it to a blueprint. Before we do that, however, we have to put those labels in place from which our naming standard was constructed. After all, vRA has to be able to tell the pieces and parts from which to pull actual names. We do this through the use of custom properties and by assigning them at specific locations inside vRA. Let’s explain.

If you’re reading this it’s assumed you are familiar with custom properties, but if you aren’t familiar with them know that they’re essentially key/value pairs that enable a rich system of metadata within vRA. Properties can influence the behavior of vRA itself, or be used as tags that are consumed by other things for eventual action. The latter is how the SovLabs module works. Let’s start by taking the first element in our name, {{Location}}. If you have two datacenters into which you can deploy resources, you need to distinguish between the two. You more than likely have a vCenter at each location, and within vRA, vCenter Server is seen as an Endpoint. Find them at Infrastructure -> Endpoints -> Endpoints. Choose your vCenter endpoint and click on the Properties tab. We need to add a new property here with the idea being that if a machine were to be targeted at this endpoint, it would pick up any custom properties associated with it. Likewise, if it went to another endpoint, it would pick up all the properties saved on it. In this manner, vRA does a kind-of “crawl” through the system and whatever constructs were used in forming a machine the related properties are collected into a bundle and delivered to vRO for processing. Create a new custom property and call it Location. In our example naming scheme, location was three characters in length, so give the value of Location as three characters. I’m in Lexington, so I’ll call this value LEX.

![Custom property applied to vSphere endpoint in vRA](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/image7.png)

If you’ve followed me thus far you’re probably getting the picture here, but just to state it more openly: We need to add custom properties throughout vRA and give them the necessary values which will factor into the custom name.

To save time, here’s a table that shows the custom property, its value, and where in vRA I created it. This will hopefully give you a good idea as to what’s possible with these properties, but do understand that there are more places than this where properties can be attached.

![Custom property reference table](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/table.png)

Ok, so let me show you the blueprint portion since it may not be clear from the table above where those related properties are.

I created a blueprint called “Oracle” and inside it is a single vSphere machine. There are three of the properties above that I created somewhere in this blueprint. First, the application I created on the blueprint object itself. You access this by editing the blueprint and choosing the gear icon in the upper-left corner.

![Edit blueprint icon](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/image8.png)

Three things we have to do here on the blueprint object: 1.) Attach the property group that invokes the modules; 2.) Attach the group which calls our naming scheme; and 3.) Add the Application custom property that contains ORA corresponding to Oracle. When you click the Properties tab, click the Add button and browse for the following property groups.

![Available property groups to select](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/image9.png)

![Attached property groups to blueprint](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/image10.png)

On the Custom Properties tab now, add a new one and call it Application and provide ORA as the value.

![Define new custom property called `Application` and set value to `ORA`](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/image11.png)

Click OK as we’re done here. Now, click on the vSphere machine you dragged onto the design canvas and go into the Properties tab, Custom Properties sub-tab. Create two additional properties as shown in the table and provide the values.

![Define new custom properties on the machine object](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/image12.png)

Make any other changes you need and save the blueprint. Go through the process to publish and entitle it in your catalog. Now let’s go and request it to see if we get the name we want.

![Sample catalog item](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/image13.png)

![Sample catalog item request is successful](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/image14.png)

![VM in inventory from request with custom name](/images/2017-10/custom-naming-in-vra-with-zero-custom-coding/image15.png)

And, bam, there it is! So if we request another at this point, it’ll be 002. But if we were to build another blueprint and leave all the same values except change the Application custom property to a something else, say like NGX, the name would be **LEXV-LPRONGX001** because this is a different unique key so the sequence is different.

Now you know the power of what this can do for your custom naming strategy, so feel free to try out various combinations of names, create different blueprints with different machines, and assign custom properties all throughout vRA. Once you become proficient with stringing properties together, have a look at the [template language](http://docs.sovlabs.com/framework/sovlabs-template-engine.html) it uses for even more flexibility. For example, maybe you want to re-use the OS custom property in multiple workflows aside from just custom naming, but you need the full word “Linux” and not just a single letter. Using the template engine, the module can perform operations on those property values at runtime, for example you could use the truncate filter to just get the letter L by doing {{OS | truncate: 1}}, and if your naming standard uses lower-case letters you can perform even more manipulation by doing {{OS | truncate: 1 | downcase}}. This would give you the lower-case “l” from the property that has the value “Linux”.

I hope this article has proven how immensely powerful yet simple and elegant this module is at producing complex names that were impossible otherwise, and all while writing absolutely zero custom code yourself. There’s no need to fear wrapping vRA into your company’s custom naming standard now, because regardless of how complex or involved it may be, the module can handle it with ease.
