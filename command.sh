#!env sh

help() {
  cd `npm root`/mutasync-server
  echo 'mutaserv'
  cat package.json | grep version
  echo 'usage : ./script run mutation_file'
}

run() {
  if [ "$1" ]
  then
    echo `pwd`/"$1"
    export MUTATIONS=`pwd`/"$1"
    cd `npm root`/mutasync-server
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
