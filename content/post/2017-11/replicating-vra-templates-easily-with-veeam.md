---
title: "Replicating vRA Templates Easily with Veeam"
date: 2017-11-02
description: "Using Veeam to replicate vSphere templates used by vRealize Automation."
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2017-11/replicating-vra-templates-easily-with-veeam/featured.jpg"
categories:
  - Technology
tags:
  - vsphere
  - veeam
  - vra
  - vrealize
---

For those who use vRealize Automation (vRA), you’re probably all too familiar with vSphere templates and how they are the crux of your service catalog. Unless you’re creating machine deployments anew from another build tool, you’re probably using them, and it’s likely you have at least two, sometimes many more. Using the Clone workflow, those vSphere templates become the new VMs in your deployments. That part is all well and good, but do you fall into the category of having several templates? How about multiple data centers across multiple geos? It becomes a real chore when patching time comes around. It’s bad enough having to convert, power on, update, power down, and convert again two templates let alone a dozen only to be forced to multiply that work times the number of sites you have. So, in the words of the dozens of infomercial actors out there hawking questionably useful gadgets and gizmos...

![There has got to be a better way!](/images/2017-11/replicating-vra-templates-easily-with-veeam/image1.png)

I’m glad to share with you in this new article that there is indeed a better way if you happen to be using Veeam Backup & Replication. And the best part is this won’t even cost you so much as one easy payment of $19.95. Read on for the best thing since the [Slumber Sleeve](http://www.slumbersleeve.com/).

Let’s start off with a basic scenario:  You have two different data centers, each managed by a different vCenter with Veeam Backup & Replication able to reach both of them. There is at least one Veeam proxy per site. One site is considered the “primary” site while the other is “secondary.” Your templates are updated only on the primary site but you wish them to be available at the secondary site as well. vRA has endpoints set up for both vCenters with reservations and blueprints created for both locations. This is a very common scenario and can be achieved here, not to mention replication to any N other sites. As the scenario was described, make sure you do have those prerequisites met. If you don’t yet have a second endpoint in vRA with blueprints for the second location, that’s not a problem. But do ensure Veeam is operational, has proxies at both sites, and that those vCenters have been added to Veeam’s Managed Servers inventory list. Also, PowerCLI will be necessary on the Veeam management server. This process as well as the scripts I’ll provide were developed and tested with PowerCLI 6.5.2 against vCenter 6.5 U1 and Veeam 9.5 U2, but presumably they should work on earlier versions of each as well.

To start this process off, we need to make sure there is some level of organization in vCenter on both sites. Place all your vRA templates into a dedicated folder within the source vCenter. That is to say, any template you want replicated needs to go in one specific folder. I just called mine “vRA Templates” and it is a subfolder of “Templates” because I have others that are not for vRA’s use.

![Template folder structure in vSphere](/images/2017-11/replicating-vra-templates-easily-with-veeam/image2.png)

Pretty simple with one Windows and one Linux. Also, keep in mind that these templates have the guest/software agent installed on them, and it can only be pointed to one vRA environment, so if you’re thinking of replicating them to another data center for another vRA’s use, you might need to use another method. In the second site, create a folder of the same name.

Now, in that second site and within that folder, create new VMs but give them the same configuration as your templates. For example, my CentOS 7.2-vRA template you see there is a 1 x 2 x 6 configuration. Create the same configuration in a new VM in the second location. Feel free to give it another name, or append a portion to the name for uniqueness, however this is not required. Join it to a portgroup of your choice keeping in mind vRA will have the ability to change this when deployed. Here’s the thing, though, you do *NOT* need to power it on or load any sort of OS. Just leave it there as a shell of a VM in a powered-off state. Why is this necessary? Because although Veeam is perfectly capable of creating replicas at the destination, we can’t have that in this case due to the instanceUUID value, also known as the vc.uuid. This is the ID by which vCenter tracks different VMs and each is based off of the vCenter unique ID. The instanceUUID is consequently how vRA tracks VMs and so all must be unique even across sites. If we let Veeam create the VM replica at the destination, those IDs would not be unique thus vRA would not know about both of the templates as different objects. By manually going through this creation process once, we can ensure those IDs are unique and Veeam will honor them going forward with replication. With some simple PowerShell, we can verify those instanceUUIDs and keep track of them for later.

```ps1
$vm = Get-VM -Name "MyVMName"
$vm.extensiondata.config.InstanceUUID
```

With the template shells created at the destination, make sure you convert the templates at the source side to VMs. It’s time to set up the Veeam replication job. Again, before doing so, make sure both vCenters are in Veeam’s inventory and you have proxies available in both locations.

1. Create a new replication job. Before navigating away from that first screen, two very important check boxes we must have in place.

![Veeam replication job, check these boxes](/images/2017-11/replicating-vra-templates-easily-with-veeam/image3.png)

Check “Low connection bandwidth” and “Separate virtual networks”.

2. Select the VM folder at the source containing your vRA templates.

3. At the Destination step, select the necessary resources including the folder at the destination containing those shell VMs.

4. On the Network selection, select the portgroup on the source side where those templates are joined, and then the portgroup on the destination side where your shells are joined.

5. On Job Settings, select the repository of your choice. Clear the selection for the replica suffix as we won’t need that (or assign something else). Change restore points to 1 since you must have at least one. In the Advanced Settings option, leave the defaults set ensuring the two options under the Traffic tab are enabled.

![Enable data reduction options on the job](/images/2017-11/replicating-vra-templates-easily-with-veeam/image4.png)

6. Data Transfer, select options to fit your infrastructure.

7. Seeding. This is the key. We’re going to map our replicas to those shells we created earlier at the destination.

![Enable replica mapping to existing VMs at destination](/images/2017-11/replicating-vra-templates-easily-with-veeam/image5.png)

We won’t use the initial seeding functionality, only the replica mapping. Click each template and manually map it to those new shells. Don’t rely on the detect functionality as it probably won’t come up with the right systems.

8. Guest Processing. Don’t need it since these will be powered off.

9. Schedule is up to you. Since Veeam won’t replicate anything if no data has changed on these templates, it’s safe to set it to a more frequent interval than that in which you’ll be updating them.

10. Click Finish to save the job.

Now, if you were to run the job now, it wouldn’t process anything if you converted those VMs back to templates at the source. The reason being that Veeam can’t replicate templates natively, so they must be converted. A couple scripts I’ll provide you here are for the pre- and post-job processing of the job. The pre job script automatically converts that folder of templates into VMs. Once done and the Veeam job started, it processes them normally. The post-job script reverses the process. In addition to templates needing to be VMs for replication to function, the added benefit is CBT can be leveraged to find and only move the blocks of data that are different. If you’re familiar with backup jobs, you may know that they are capable of backing up templates, but only in NBD mode and without CBT. So this process of template-to-VM conversion and back actually saves time if that data needs to be moved over a WAN to remote sites.

The last thing to do here is to download the pre- and post-job scripts I’ve provided, modify them slightly, and configure them in the advanced job settings options. Both scripts have been made with ease of use and portability in mind. The only things that need setting by you are the username and password options.

Edit the PRE script to change the $username and $password variables, and do the same for the POST script. Since this is obviously sensitive information, you’ll want to keep access controlled to these scripts somewhere local to your Veeam server. Once this is done, edit your replication job and go to Job Settings -> Advanced (button) -> Scripts. Check both boxes to run the script at every 1 backup session.

![Enable job scripts in Advanced Settings](/images/2017-11/replicating-vra-templates-easily-with-veeam/image6.png)

For the path, specify them as the following:

```ps1
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -File "D:\Replicate vRA Templates PRE.ps1" -SourcevCenter "source_vC.domain.com" -DestinationvCenter "dest_vC.domain.com" -FolderName "My vRA Templates"
```

Since the scripts accept parameters for source, destination, and folder, we can just pass these in as arguments in the program path.

So after getting that plumbed up, you should be ready to run your replication job. The overall process that happens will be something like this.

1. Pre-job script runs. Converts folder of templates at source and destination to virtual machines.
2. Veeam replication begins. Replicas are mapped. Disk hashing of destination VMs begins.
3. Data is replicated from source to destination using available proxies.
4. Replication complete. Retention applied by merging snapshots (if applicable).
5. Post-job script runs. Checks destination VMs to see if vCenter reports VMware tools as installed. If no, starts VM, waits for tools status, then shuts down. If yes, converts VMs at destination to templates. Converts VMs at source to templates.

Step 5 may look a little strange. Why does it care about VMware tools status on a powered-off VM? This is because customizing a VM using a customization spec uses the VMware tools channel to push the configuration. If VMware tools are not installed, customization cannot happen, and even if tools really are installed but vCenter sees they are not, it will still fail. If customization fails, vRA fails, too, since vSphere machines require vCenter customization specs for things like static IPs and domain joins. So the workaround here is to power on the VM until tools starts. At that time, vCenter will pick up on it and change what it has recorded in its configuration to reflect that tools are installed. This is what will allow customization to succeed. Once this status is updated on the VM, the script will then perform a guest OS shutdown (not a power off) followed by a conversion to template.

One possible workaround if you would prefer not to have this script power on your destination VM/template every time is to, after the initial replication completes, power on the VM yourself waiting for VMware tools, shut it down, then merge the snapshot that Veeam just created. Doing so will retain the tools status, but upon the next run of the replication job will trigger another disk hashing run. This disk hashing will have to check all the blocks on the destination VM to ensure the data is as it left it before proceeding with another replication cycle. But it is one possibility if, for some reason, you cannot have your templates being brought up due to run-once scripts or configurations getting updated, etc.

There you go. You now have your templates from your source site at your destination site ready to consume with vRA. Because we performed replica mapping, they should be discrete instances of templates, even if the names are the same, due to different instanceUuids. One last thing is to validate from vRA’s side that these templates are, in fact, separate and we can consume them independently. With IaaS Administrator permissions, login to vRA and go to Infrastructure -> Compute Resources -> Compute Resources. Hover over the compute resource corresponding to your remote site and perform a data collection.

![Begin a data collection in vRA](/images/2017-11/replicating-vra-templates-easily-with-veeam/image7.png)

Request an Inventory data collection.

![Only an Inventory data collection is required](/images/2017-11/replicating-vra-templates-easily-with-veeam/image8.png)

Once successful, either create a new blueprint or edit an existing one. Click on your vSphere machine object on the canvas, go to the Build Information tab, and click the button next to the Clone from field. You should now be able to see templates from both sites in the list and eligible for selection on your blueprints.

![Templates available in vRA from both sites](/images/2017-11/replicating-vra-templates-easily-with-veeam/image9.png)

Now all that’s left for you to do is consume them in vRA any way you wish!

What if you have multiple sites and want to do a one-to-many replication? That’s no problem either. Simply duplicate the process for the second vCenter in a new replication job, and for the scheduling portion, select the “After this job” option and pick the first replica job you created. Also be sure to edit the arguments of the pre- and post-job script configurations so it reflects the correct destination vCenter. Remember, you’ll still need to create one-time “shell” VMs at your other sites and store them in a consistent folder. You can chain as many of these together as you want and vRA will be able to see them independently.

As you can see, replication of your vRA templates can be done fairly easily with the provided scripts and allows great benefits in the form of time savings and consistency. No more having to manually patch and update the same template in multiple sites. No more user error involved in forgetting to do something on one site that you did in another. And no more failing audits because your corporate, hardened template in your other site didn’t get the new security settings. Now you too can be like one of the millions of satisfied customers with your handy-dandy vRA Template Replicator!

![God, this Snuggie is comfortable](/images/2017-11/replicating-vra-templates-easily-with-veeam/image10.png)

I wish to give special thanks to [Luc Dekens](https://twitter.com/LucD22) for his scripting expertise and assistance in this project. He was very generous in providing some code snippets and reviewing the process of the precursors to the scripts provided here, and he frequents the PowerCLI forum on the VMTN Community where helping others with their PowerShell scripting challenges. Thank you, Luc!

## [**DOWNLOAD SCRIPTS**](https://github.com/chipzoller/BlogScripts/tree/master/ReplicatingvRATemplatesEasilyWithVeeam)
