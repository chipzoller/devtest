---
title: "SovLabs Property Toolkit Part 2: Dynamic Custom Property Assignment"
date: 2018-03-21
description: "Dynamically assigning custom property values with SovLabs Property Toolkit."
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2018-03/sovlabs-property-toolkit-part-2/featured.jpg"
categories:
  - Technology
tags:
  - vra
  - vrealize
  - sovlabs
---

Welcome back to another installment of the exploration of the SovLabs modules! A while back, I went through and introduced the Property Toolkit module via a use case of dynamically building custom properties based on the presence of other custom properties. I illustrated this in the form of [placement in vCenter folders](/post/2017-09/vra-and-the-problem-of-the-vcenter-folder/). In this article, however, I want to dive into another feature of this amazingly powerful module: dynamic property sets. With dynamic property sets, you are able to set the value of one or more custom properties based off of the value of a reference custom property. In so doing, you can greatly simplify your request forms by having multiple values defined in the background based on just a single one that is manually chosen. Read on to see how this is accomplished.

Custom properties (CPs henceforth) are the lifeblood of vRA, as many of those reading this know. They are a rich system of metadata which can influence not only the decisions made by vRA proper but also extensibility through vRO. CPs are life, effectively, and one of the biggest challenges is managing those CPs and having their values set simply and without too much complexity. A common problem arises in the face of this which amounts to CP sprawl in a request form. When CPs are used for most major decisions, the user in the request form may be bombarded with a whole array of them which can slow down provisioning time, increase adoptability, and lead to user error (by virtue of incorrect selection in the form). Property Toolkit can help eliminate almost all of these through transparent, background, silent assignment of other properties.

Consider this scenario: Your vRA catalog requires users to select a number of values which steer the deployment in a variety of ways. For example, you ask the user to select the following: Application, Environment, Storage, and Network. But you require them to select the correct value based on an earlier selection, like where the application is “Oracle” they need to provision this to “Production” only as other environments are not licensed appropriately. And also, given the environment, there is a specific network associated with only that environment and so they have to pick the correct one. Now, this can be done with vRO actions, but wouldn’t it be nice if you could only ask them to choose *one* thing in the form and all other decisions were made automatically? Further, wouldn’t it be awesome if all that logic *didn’t* require you to design new workflows or actions in vRO or crunch new JavaScript? Well, if this is something you’re looking to do (or any variant thereof), then Property Toolkit is your savior because that’s exactly what it’s designed to do (plus more). Let’s see how to do this in a real life example.

We need to set several CPs to steer a deployment to the correct place. These are as follows:

1. Environment. This sets the target cluster where the machine(s) will be built.
2. Reservation Policy. Selects the right reservation policy (which can open up things like endpoint and datacenter).
3. Network Profile. Sets the correct network on which the machine(s) will be attached.
4. Name. Provides part of the name in our custom naming standard.
5. Storage Reservation Policy. Sets the storage which will be consumed.

Now, we could list each of these individually in a request form and have the user select each and every one (after making sure to tell them how to complete the form). But even easier, let’s define only a single CP and have each of these 5 CPs get their value based on it. I’m going to create a CP called `My.RequestForm.Prop` and provide three possible values: `A`, `B`, and `C`.

![`My.RequestForm.Prop` with list of static values](/images/2018-03/sovlabs-property-toolkit-part-2/image1.png)

I’ll show this as a dropdown in the form. These values can be whatever you like, but I’m just using simple letters in this case for illustration. For example, instead of `A`, `B`, and `C` these could be application names like `Oracle`, `JBoss`, and `Apache`.

Next, I want to set the first of the dynamic properties, Environment, based on the value of `My.RequestForm.Prop`. The Environment CP will be called `CZ.MyProp.Environment` and the choices I have are `Prod`, `Dev`, and `QA`. I’ll map them one-for-one to the values you see above in `My.RequestForm.Prop`. In other words, if a user selects `A` from the list, then the value of `CZ.MyProp.Environment` will be dynamically set to `Prod`. If the user chooses `B` then it’ll be `Dev` and so on. In order to do this, all we need to do is create a new property on the deployment and call it `SovLabs_CreateProperties_<anything>`. The `<anything>` portion can truly be whatever you want—it’s only a label for your organizational purposes. So long as the property begins with `SovLabs_CreateProperties_` then it’ll invoke the Property Toolkit module. The value of this property can be a variety of things as explained in the [documentation](http://docs.sovlabs.com/vRA7x/2018.1.x/modules/property-toolkit/setup/), but in this case let’s use an array of single objects. The value of this property becomes the value of another property. For example, if I wanted to define a new property in the simplest way, I could set the value to this:

```json
[{
  "name" : "CZ.Cities",
  "value" : "Texas"
}]
```

When the module ran, I would then get a new CP defined on the deployment with name of `CZ.Cities` and a value of `Texas`. But, because everything SovLabs does is templated, we have a [whole host of operators](http://docs.sovlabs.com/vRA7x/2018.1.x/framework/sovlabs-template-engine/tags/) at our disposal thanks to the templating engine. The one which we want to use here is the [case/when](http://docs.sovlabs.com/vRA7x/2018.1.x/framework/sovlabs-template-engine/tags/#case_when) operator. This will allow us to switch to a different value based on another value. So getting back to the new CP we want to set, the value of that property would get defined as such:

```json
[{
  "name" : "CZ.MyProp.Environment",
  "value" : "{% case My.RequestForm.Prop %}{% when 'A' %}Prod{% when 'B' %}Dev{% when 'C' %}QA{% else %}UNKNOWN{% endcase %}"
}]
```

It’s fairly straightforward. If the value set in `My.RequestForm.Prop` equals `A` then assign the value of `Prod` to `CZ.MyProp.Environment`. If that value is `B` then let it equal `Dev` and so on.

Now we have that one, let’s define the others with the same basic statement. To simplify this, you can put them all in a single property group and attach that property group to your blueprint. To save time, I’ve drawn up the following table which shows the combinations.

| CP Name                                       | CP Value     | CP Value     | CP Value     |
|-----------------------------------------------|--------------|--------------|--------------|
| `My.RequestForm.Prop`                           | `A`            | `B`            | `C`            |
| `CZ.MyProp.Environment`                         | `Prod`         | `Dev`          | `QA`           |
| `CZ.MyProp.ResPol`                              | `ReservationA` | `ReservationB` | `ReservationC` |
| `CZ.MyProp.NetProfile`                          | `NetworkA`     | `NetworkB`     | `NetworkC`     |
| `SovLabs.Naming.App`                            | `TST`          | `ORA`          | `APA`          |
| `VirtualMachine.Disk0.StorageReservationPolicy` | `Diskstation`  | `vSAN`         | `Diskstation`  |

\
Effectively, then, the value of a single property (`My.RequestForm.Prop`) will influence the outcome of five other properties dynamically. Graphically, it can be represented as the following.

![`My.RequestForm.Prop` impact](/images/2018-03/sovlabs-property-toolkit-part-2/image2.png)

If the value of `My.RequestForm.Prop` equals `A` then all the following values are set below it. If `B`, then all those in that column apply, etc. In this demo, I built a single property group and stashed all these properties there, although they could be in just a single dynamic property definition if you wish.

![Property group](/images/2018-03/sovlabs-property-toolkit-part-2/image3.png)

The exception is the CP `VirtualMachine.Disk0.StorageReservationPolicy` as this must be set on the machine element in the canvas and not the blueprint level.

If we flip over to the request form, we can see how simple this can be when presented to the end user.

![vRA catalog item request form with drop-down](/images/2018-03/sovlabs-property-toolkit-part-2/image4.png)

Let’s select A then deploy to see what happens.

![Deployment produced LEXVTST21](/images/2018-03/sovlabs-property-toolkit-part-2/image5.png)

![Custom properties on LEXVTST21](/images/2018-03/sovlabs-property-toolkit-part-2/image6.png)

Based on the value `A` the Property Toolkit then set the 5 CPs we were after, including `SovLabs.Naming.App` which I am then consuming in another SovLabs module for Custom Naming (which produced the “TST” portion of the hostname you see). It got the correct Environment, it got the correct Reservation Policy, Network Profile, and it also went to the correct storage because this property, while on the machine element, still was able to be set from the initial value of `A`.

![Deployed machine received intended storage reservation policy](/images/2018-03/sovlabs-property-toolkit-part-2/image7.png)

Although I’ve obviously created a few of these properties myself to illustrate what you can do, you can use this module to set any CP, even reserved system properties such as the one that controls the storage reservation policy. Can you not see how incredibly flexible this can make your deployments? We can ask the user to make but a single decision, and based on that outcome we can then dynamically set any number of other CPs. That’s amazing if you ask me and something that, prior to the Property Toolkit, required a whole heap of complex JavaScript and vRO plumbing to get done.

So, this is cool, but let’s take it one step further. Let’s let `My.RequestForm.Prop` influence another CP, and then let’s let *that* value influence **another** CP. In this manner, we can create cascading dynamic property assignment. Here’s what I mean.

Let’s still ask the user to pick a value of `My.RequestForm.Prop`. The value they choose will still influence the Environment CP (`CZ.MyProp.Environment` if you recall). But, rather than basing the Reservation Policy CP on `My.RequestForm.Prop`, what if we could determine that from the Environment CP? Graphically, it’d be represented like this:

![Cascading dependency on `My.RequestForm.Prop`](/images/2018-03/sovlabs-property-toolkit-part-2/image8.png)

And to put that in context with the other properties, the altered flow chart would result as the following.

![Full custom property graph](/images/2018-03/sovlabs-property-toolkit-part-2/image9.png)

In order to distinguish, I’ll change the possible values of `CZ.MyProp.ResPol` from the table previously to be the following: `ReservationPrd`, `ReservationDev`, and `ReservationQA`. Now, let’s change the definition of `CZ.MyProp.ResPol` to key off of `CZ.MyProp.Environment` and not `My.RequestForm.Prop`.

```json
[{
  "name" : "CZ.MyProp.ResPol",
  "value" : "{% case CZ.MyProp.Environment %}{% when 'Prod' %}ReservationPrd{% when 'Dev' %}ReservationDev{% when 'QA' %}ReservationQA{% else %}UNKNOWN{% endcase %}"
}]
```

Let’s make the same request and see what happens this time.

![New values for custom properties](/images/2018-03/sovlabs-property-toolkit-part-2/image10.png)

Amazing! All we’ve changed is the definition for `CZ.MyProp.ResPol` in this case and nothing else. Can you imagine the possibilities this opens up? The freedom, flexibility, and power the Property Toolkit enables your vRA to have is limited only by your imagination.

To recap, then, in part one of the Property Toolkit series, we showed how it can synthesize new CPs based on the value of others. This was illustrated with the vCenter Folder use case. In part two here, we are creating dynamic property sets in which the value of multiple different CPs get their values from other CPs. We did this in two ways. The first was to assign five separate properties based on the value of one reference CP. The second was to cascade this logic by letting one equal another which equals yet another. In both cases, we achieved a dynamic assignment of various CPs even in different places by exposing just a single decision in the request form.

I really hope you’ve found this article to be helpful and that it has stirred your imagination with all the various ways you can use Property Toolkit to make your life simpler and your vRA much more powerful all while reducing complexity. It really is game-changing integration that opens so many doors all while eliminating the need to write, test, and maintain custom code. If you have any thoughts or comments about this article, please feel free to reach me on Twitter (@chipzoller).
