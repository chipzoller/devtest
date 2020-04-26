---
title: "vCSA File Backup Fails"
date: 2017-12-09
description: "How to fix vCSA file backup failure."
# author: "John Doe"
draft: false
menu: main
featureImage: "/images/2017-12/vcsa-file-backup-fails/featured.jpg"
categories:
  - Technology
tags:
  - vsphere
---

I encountered this issue in my home lab recently whereby vCSA 6.5 U1c was failing the file-based backup through the VAMI with the message “BackupManager encountered an exception. Please check logs for details.” A very generic error message to be sure, and not at all helpful. I checked the log responsible at /var/log/vmware/applmgmt/backup.log and saw the following message.

```log
2017-12-09 02:46:10,833 [ConfigFilesBackup:PID-38335] ERROR: Encountered an error during ConfigFiles backup.
Traceback (most recent call last):
  File "/usr/lib/applmgmt/backup_restore/py/vmware/appliance/backup_restore/components/ConfigFiles.py", line 223, in BackupConfigFiles
    logger, args.parts)
  File "/usr/lib/applmgmt/backup_restore/py/vmware/appliance/backup_restore/components/ConfigFiles.py", line 132, in _generateConfigListFiles
    tarInclFile.write('%s\n' % entry)
UnicodeEncodeError: 'ascii' codec can't encode character u'\xe9' in position 100: ordinal not in range(128)
```

Very odd, especially the last line about the asci codec error. I went and looked at the Python script to see why it might fail at this step. I checked line 132 to see what it was doing.

![Python code snippet](/images/2017-12/vcsa-file-backup-fails/image1.png)

After some more looking through the script, it looks fine. It’s stripping characters off paths to build the file list. Nothing unusual. I just do a cursory check around the vCSA filesystem to see what might be going on. Something catches my eye when I do a `df -h /`.

![Output of `df -h` on the vCSA](/images/2017-12/vcsa-file-backup-fails/image2.png)

It might be difficult to see, but the last entry is a UNC path to a SMB share. I then remember that I created a Content Library that is connected via SMB to my Synology. Looking at the Python again, I think it’s not handling two forward slashes well and bombing out because of it. Prior to that, the backup task is pretty simple.

![Backup task, step 1](/images/2017-12/vcsa-file-backup-fails/image3.png)

![Backup task, step 2](/images/2017-12/vcsa-file-backup-fails/image4.png)

![Backup task, step 3](/images/2017-12/vcsa-file-backup-fails/image5.png)

![Backup task, exception](/images/2017-12/vcsa-file-backup-fails/image6.png)

The second screenshot in the backup wizard was initially alarming as the “common” part was showing 0 MB in size, which clearly isn’t right. When running the backup, it fails in very short order and produces no files in the destination path.

I delete the Content Library, make sure it’s unmounted from the filesystem, then attempt the backup again. Complete success.

**TL;DR:** vCSA file-based backup has a bug which fails if you have a content library mounted over SMB. Remove or unmount the Content Library in order to have the backup succeed.
