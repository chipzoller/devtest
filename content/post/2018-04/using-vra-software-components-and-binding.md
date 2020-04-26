---
title: "Using vRA Software Components and binding any custom property"
date: 2018-04-29
description: "Custom vRA software component to bind to any custom property."
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2018-04/using-vra-software-components-and-binding/featured.jpg"
categories:
  - Technology
tags:
  - vra
  - vrealize
---

Software components (SCs) are pretty neat in vRA (although you pay a pretty penny for them), but they have some serious shortcomings. One of the really cool abilities of them is to “bind” or let a property (variable, really) assume the value of something else inside that blueprint. This makes scripts much more dynamic, but one of those shortcomings is not all properties are available to bind. In this article, I’ll give you an easy workaround that makes binding to *any* custom property which gets passed into the machine a possibility.

Property binding is accomplished by editing the property once the SC is dragged and dropped onto a machine element on your canvas and ticking the Bind box.

![Custom property binding](/images/2018-04/using-vra-software-components-and-binding/image1.png)

When you enable binding, you can then reuse the value of something else and assume its value. For example, rather than statically writing in the hostname to a SC—which you wouldn’t know since that’s assigned at runtime—you can bind a property to what would become the hostname here. Binding values have a hierarchy just like blueprints and their elements. So to accomplish this, you’d put your cursor in the Value box and press the down arrow key. In my simple, simple blueprint for testing here, this would give me the following.

![Values available for binding](/images/2018-04/using-vra-software-components-and-binding/image2.png)

The first there is the name of the machine element, second is the SC name, and third is the placeholder for all resources on the blueprint. To access the next level, select one of those three values and type the tilde character (~). It’ll then bring up a selection list of the next layer in that hierarchy.

![Second level binding](/images/2018-04/using-vra-software-components-and-binding/image3.png)

What you’re seeing here is if I select _resource~\<machine_component\>~. So to choose the hostname, we can access MachineName from the list.

Now, whenever this SC runs on the machine that gets provisioned, it’ll store the host name as the name of that property so you can reuse it elsewhere.

This is all well and good and works just fine, but some things just don’t show up in this list for example properties at the blueprint level or those stored in property groups. Something else that doesn’t appear which I noticed through a recent VMTN Communities post was binding to the second IP address for a second NIC on a machine. This just isn’t in the list, and even “ip_address” which does appear only captures the IP from the first NIC (that is, nic0). The custom property for the second NIC would be VirtualMachine.Network1.Address, and although this is something you can specify on the machine element in the blueprint, if you expect it to be pulled from a network profile or some external extensibility, you can’t specify this. This means that it isn’t available for binding in the blueprint canvas. But there’s another way!

When a SC runs via the bootstrap agent, the agent gets the full payload from vRA which contains all of the custom properties which apply to it. You can actually see these and their values in (for Linux) the log file at /opt/vmware-appdirector/agent/logs/agent_bootstrap.log.

```log
Apr 29 2018 08:39:44.640 DEBUG [pool-1-thread-1] [] com.vmware.darwin.agent.task.ScriptTaskRunnerImpl - Appending custom property:name 'dailycost' value '{"type":"moneyTimeRate","cost":{"type":"money","currencyCode":"USD","amount":0.8683999899490741},"basis":{"type":"timeSpan","unit":4,"amount":1}}'.
Apr 29 2018 08:39:44.640 DEBUG [pool-1-thread-1] [] com.vmware.darwin.agent.task.ScriptTaskRunnerImpl - Appending custom property:name 'virtualmachine.network1.addresstype' value 'Static'.
Apr 29 2018 08:39:44.640 DEBUG [pool-1-thread-1] [] com.vmware.darwin.agent.task.ScriptTaskRunnerImpl - Appending custom property:name 'cafe.request.vm.archivedays' value '3'.
Apr 29 2018 08:39:44.640 DEBUG [pool-1-thread-1] [] com.vmware.darwin.agent.task.ScriptTaskRunnerImpl - Appending custom property:name 'virtualmachine.software.execute' value 'true'.
Apr 29 2018 08:39:44.640 DEBUG [pool-1-thread-1] [] com.vmware.darwin.agent.task.ScriptTaskRunnerImpl - Appending custom property:name 'virtualmachine.network0.gateway' value '192.168.1.1'.
Apr 29 2018 08:39:44.640 DEBUG [pool-1-thread-1] [] com.vmware.darwin.agent.task.ScriptTaskRunnerImpl - Appending custom property:name 'clone_snapshotname' value 'vRA-LinkedClone'.
Apr 29 2018 08:39:44.640 DEBUG [pool-1-thread-1] [] com.vmware.darwin.agent.task.ScriptTaskRunnerImpl - Appending custom property:name 'virtualmachine.network1.address' value '192.168.5.231'.
Apr 29 2018 08:39:44.640 DEBUG [pool-1-thread-1] [] com.vmware.darwin.agent.task.ScriptTaskRunnerImpl - Appending custom property:name 'virtualmachine.network1.networkprofilename' value 'VLAN5Profile'.
Apr 29 2018 08:39:44.640 DEBUG [pool-1-thread-1] [] com.vmware.darwin.agent.task.ScriptTaskRunnerImpl - Appending custom property:name 'virtualmachine.disk1.size' value '5'.
```

Above is just a small snippet of that log, but you can clearly see the IP address of that second NIC is there. So if VMware won’t give it to us in a convenient manner through the UI, we’ll just have to take it by force.

What we need is a small function that can parse this log, find whatever custom property we want, and extract the value of that custom property. I’m glad to share that I’ve done exactly this and can give you everything you need to make that happen, for any custom property in the payload.

The magic sauce here is a well-crafted `grep` command which parses that log file to find the custom property, but only extracts the value of what is specified, and here it is:

```sh
grep -Po "(?<=virtualmachine.network1.address' value ')[^']*" /opt/vmware-appdirector/agent/logs/agent_bootstrap.log | tail -n1
```

This is a single pipeline command, so if you copy-and-paste mind there are no line breaks. What we’re doing with this command is using the Perl-style regex lookahead ability of grep to search for a string, but then discard that string in favor of what comes after it. The -P parameter performs this task while the “o” only matches the line containing this. What follows is a Perl regex that looks for “virtualmachine.network1.address” but stops looking after the value portion. It looks for this in the agent_bootstrap.log file specified at the path noted. And, finally, it pipes this result to `tail` and takes only the last value of the match. This last step is done because, otherwise, it would match on the grep command itself since it too is passed as text in this log file.

To make sense of all this, let me illustrate with a basic SC that uses this method to get that IP address. Don’t worry, I’ll upload this to VMware {code} so you can reuse and recycle at your own convenience.

I’ll create a SC with a single property. This property, however, will be a computed property. That is to say we won’t be specifying a value here or on the blueprint itself because it’ll be calculated at runtime.

![Set value of custom property to computed value](/images/2018-04/using-vra-software-components-and-binding/image4.png)

In the script portion for the Install phase, I’ll just do the following:

```sh
touch /tmp/proptest.txt
testprop3=$(grep -Po "(?<=virtualmachine.network1.address' value ')[^']*" /opt/vmware-appdirector/agent/logs/agent_bootstrap.log | tail -n1)
echo "IP is $testprop3"
echo $testprop3 >> /tmp/proptest.txt
```

I create a file inside the guest, then I use the grep string earlier to fetch the value which then gets stored as the value of the testprop3 variable. This variable is then shown as output and also written to file. Since this is a computed property, we can then bind *other* properties to this one and have its value passed there. In so doing, this effectively works entirely around the inability to natively bind to an arbitrary custom property in the UI!

Let’s see it in action.

I’ll add this SC to a blueprint and request it. Wait for the execution to complete.

![vRA deployment logs](/images/2018-04/using-vra-software-components-and-binding/image5.png)

Then look at the details for the SC (ellipsis button).

![Software component execution details](/images/2018-04/using-vra-software-components-and-binding/image6.png)

Bang, there it is. Check the VM to ensure this is what was assigned the second NIC.

![VM in vCenter inventory showing all IPs](/images/2018-04/using-vra-software-components-and-binding/image7.png)

And if we cat the file created in the SC, it has written that value out there showing we can reuse it however and wherever we want.

```sh
[root@LEXVTST69 logs]# cat /tmp/proptest.txt
192.168.5.231
```

So as I’ve illustrated, using a little bit of trickery, we can capture the value of any custom property that is sent as a payload to a provisioned virtual machine. Simply replace the name of the custom property with the one you want to use. Hopefully this gives you new power and flexibility with your software components.
