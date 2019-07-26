#!env sh

help() {
  cd `npm root -g`/mutaserv
  echo 'mutaserv'
  cat package.json | grep version -m 1
  echo 'usage : ./script run mutation_file'
}

run() {
  if [ "$1" ]
  then
    echo `pwd`/"$1"
    mutaserv-format `pwd`/"$1" >> /tmp/formated-"$1"
    export MUTATIONS=/tmp/formated-"$1"
    cd `npm root -g`/mutaserv
    npm run start
  else
    help
  fi
}

if [ "$1" ]
then
  run $1
else
  help
fi
