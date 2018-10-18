#!/usr/bin/perl -w
use strict;
my $loc = "gs://testbed-187316-vcm/iran";
open(IMAGES, ">images.csv") or die "Can't open images.csv: $!\n";
open(VIDEOS, ">videos.csv") or die "Can't open videos.csv: $1\n";
open(GIFS, ">gifs.csv") or die "Can't open gifs.csv: $1\n";

LINE:
foreach my $file (`find . -type f | grep -v csv | grep -v zip`) {
  chomp($file);
  next LINE if(!$file);

  my $md5 = `md5sum "$file" | awk '{ print \$1 }'`;
  chomp($md5);
  
  $file =~ s/^\.\///;

  $file =~ m/(.*?)\/([^\/]+)\/(images|videos|gifs)\/(\d+)-.*?\./;
  my $segment=$1;
  my $user=$2;
  my $tweet=$4;

  if (!$tweet) {
     die "Fuck: $file ---  $segment -- $user --- $tweet\n";
  } 

  if ($file =~ m/images/) {
    print IMAGES "$loc/$file,$md5,$tweet,$user,$segment\n";
  } elsif ($file =~ m/videos/) {
    print VIDEOS "$loc/$file,$md5,$tweet,$user,$segment\n";
  } elsif($file =~ m/gifs/) {
    print GIFS "$loc/$file,$md5,$tweet,$user,$segment\n";	  
  } else {
    die "WTF: $file\n";
  }
}

close IMAGES;
close VIDEOS;
close GIFS;
