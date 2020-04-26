---
title: "How to Cleanly Remove a vSphere Datastore"
date: 2018-01-06
description: "Steps to properly and cleanly remove a datastore from vSphere's inventory."
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2018-01/how-to-cleanly-remove-vsphere-datastores/featured.jpg"
categories:
  - Technology
tags:
  - vsphere
---

Removal of datastores is one of those things that seems like it would be simple, and it’s not complex, but there a few steps and you have to do them in the correct order to produce the best result. There are also some KB articles out there that are rather outdated, have mixed information, and don’t cover the graphical options available today. So in this short article, I’m going to run through the best practice way to remove a datastore from an ESXi host without destroying its data. These steps are generated on vSphere 6.5 U1 using the web client. Using this method is preferable for workflows like unpresenting storage from a set of hosts and migrating it to others, lab tests, or anything else where you want a clean inventory view while preserving VMs.

Right, so here’s what my inventory consists of.

![vSphere inventory, hosts and clusters view](/images/2018-01/how-to-cleanly-remove-vsphere-datastores/image1.png)

![vSphere inventory, datastores view](/images/2018-01/how-to-cleanly-remove-vsphere-datastores/image2.png)

I’ve got an iSCSI datastore mounted to two clusters of two hosts and there are two VMs on this datastore. The objective is to remove the ClusterA-iSCSI-01 datastore from all hosts leaving no traces behind in inventory. What we don’t want is for them to show up like this, which, if you’re reading this, you’ve probably made that mistake before.

![vSphere inventory, datastores view, this is bad](/images/2018-01/how-to-cleanly-remove-vsphere-datastores/image3.png)

Let’s go through the steps here:

1. Power down all VMs on the datastore you wish to remove.
2. Unregister all powered down VMs from inventory.
3. Unmount the datastore from all hosts.
4. Detach the device from all hosts.
5. Rescan for storage devices.

Five steps, and you need to do them in this order if you want clean removal of the datastore from your vCenter’s inventory while preserving the data. Let’s go through them one by one.

## 1. Power Down VMs

Pretty simple. All VMs on this datastore must be powered off.

## 2. Unregister all VMs

Again, straightforward. You cannot unmount a datastore that has any registered VMs on it, which includes templates. Right-click each VM and unregister it.

![Right-click context menu on VM](/images/2018-01/how-to-cleanly-remove-vsphere-datastores/image4.png)

## 3. Unmount the Datastore

With all VMs unregistered, right-click on the datastore and unmount it.

![Right-click context menu on datastore](/images/2018-01/how-to-cleanly-remove-vsphere-datastores/image5.png)

Make sure you select all hosts.

![Unmount from all hosts](/images/2018-01/how-to-cleanly-remove-vsphere-datastores/image6.png)

Wait for the vSphere task to complete. Once done, you should see this in inventory.

![Inactive datastore](/images/2018-01/how-to-cleanly-remove-vsphere-datastores/image7.png)

## 4. Detach the Disk Device

Now that it’s unmounted, we have to go to each ESXi host and detach the disk device that corresponds to that VMFS volume. Go to the host and choose Configure -> Storage Devices.

![Host-level disk devices](/images/2018-01/how-to-cleanly-remove-vsphere-datastores/image8.png)

Highlight the device corresponding to the datastore you just unmounted. From the Actions menu, choose “Detach” or click the icon.

![Right-click context menu on host-level disk device](/images/2018-01/how-to-cleanly-remove-vsphere-datastores/image9.png)

Click Yes to confirm.

Once detached, the state should change.

![Host disk is detached](/images/2018-01/how-to-cleanly-remove-vsphere-datastores/image10.png)

Repeat this process on all hosts.

## 5. Rescan for Disks

Still on the Storage Devices screen, click the Action menu and choose Rescan Storage.

![Right-click context menu on adapter](/images/2018-01/how-to-cleanly-remove-vsphere-datastores/image11.png)

Click OK for both check boxes.

Rinse and repeat on all ESXi hosts.

Once all hosts have been rescanned, you’ll see the previously inactive datastore has vanished.

![vSphere datastores inventory view with no datastores](/images/2018-01/how-to-cleanly-remove-vsphere-datastores/image12.png)

At this point, you may now have your storage administrator unpresent the LUN from the ESXi hosts but not before. Once they have done so, if you were to rescan one more time, you’ll see the old device that was in a Detached state has been removed from the list entirely.

And that’s it. It’s not a complex process, but it needs to be done in a certain order to make your vCenter inventory and host view all tidy.
