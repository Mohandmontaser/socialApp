import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: string | Date): string {

    const date = new Date(value);
    const now = new Date();

    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
      return 'Just now';
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h`;
    }

    const days = Math.floor(hours / 24);

    if (days === 1) {
      return 'Yesterday';
    }

    if (days < 7) {
      return `${days}d`;
    }

    const weeks = Math.floor(days / 7);

    if (days < 30) {
      return `${weeks}w`;
    }

    const months = Math.floor(days / 30);

    if (days < 365) {
      return `${months}mo`;
    }

    const years = Math.floor(days / 365);

    return `${years}y`;
  }

}