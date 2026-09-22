<script setup lang="ts">
import type { Backup, BackupMode } from '@/shared/db';
import { DownloadIcon, Trash2Icon, UploadIcon } from '@lucide/vue';
import { Button, downloadFile, toast, useConfirm } from 'shonk-ui';
import { computed, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import {
  applyBackup,
  backupFileName,
  collectBackup,
  describeBackup,
  readBackup,
  wipeAllData,
} from '@/shared/db';
import { useLocale } from '@/shared/lib';

const router = useRouter();
const confirmation = useConfirm();
const { isEnglish } = useLocale();
const copy = computed(() => isEnglish.value
  ? { export: 'Export backup', import: 'Import backup', loaded: 'Backup imported', replace: 'Replace all', merge: 'Add to current', cancel: 'Cancel', erase: 'Erase all data', file: 'File contains', warning: 'Replace deletes current data. Add keeps your current profile.', confirm: 'Profile, diary, dishes and weight history will be erased from this device.', eraseAction: 'Erase' }
  : { export: 'Выгрузить копию', import: 'Загрузить копию', loaded: 'Копия загружена', replace: 'Заменить всё', merge: 'Дополнить', cancel: 'Отмена', erase: 'Стереть все данные', file: 'В файле', warning: '«Заменить всё» удалит текущие данные. «Дополнить» сохранит нынешний профиль.', confirm: 'Профиль, дневник, свои блюда и история веса будут стёрты с этого телефона.', eraseAction: 'Стереть' });

const picker = useTemplateRef<HTMLInputElement>('picker');
const pending = ref<Backup | null>(null);
const busy = ref(false);

async function saveToFile() {
  const backup = await collectBackup();

  downloadFile(new Blob([JSON.stringify(backup)], { type: 'application/json' }), backupFileName());
}

async function pickFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  input.value = '';

  if (!file) {
    return;
  }

  const result = readBackup(await file.text());

  if (result.ok) {
    pending.value = result.backup;
  }
  else {
    toast(result.reason);
  }
}

async function restore(mode: BackupMode) {
  const backup = pending.value;

  if (!backup || busy.value) {
    return;
  }

  busy.value = true;

  try {
    await applyBackup(backup, mode);
    pending.value = null;
    toast(copy.value.loaded);
  }
  finally {
    busy.value = false;
  }
}

async function wipe() {
  await wipeAllData();
  await router.push('/');
}

function askToWipe() {
  confirmation.require({
    message: copy.value.confirm,
    acceptButtonText: copy.value.eraseAction,
    accept: () => {
      void wipe();
    },
  });
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="grid grid-cols-2 gap-2">
      <Button type="button" variant="outline" class="h-auto flex-col gap-2 py-3" @click="saveToFile">
        <DownloadIcon class="size-5 text-[#64aaff]" />
        {{ copy.export }}
      </Button>

      <Button type="button" variant="outline" class="h-auto flex-col gap-2 py-3" @click="picker?.click()">
        <UploadIcon class="size-5 text-[#71e18f]" />
        {{ copy.import }}
      </Button>
    </div>

    <input
      ref="picker"
      type="file"
      accept="application/json,.json"
      class="hidden"
      @change="pickFile"
    >

    <div v-if="pending" class="flex flex-col gap-3 rounded-lg border border-border bg-secondary p-4">
      <p class="text-sm text-foreground">
        {{ copy.file }} {{ describeBackup(pending) }}.
      </p>
      <p class="text-xs text-muted-foreground">
        {{ copy.warning }}
      </p>

      <div class="grid grid-cols-2 gap-2">
        <Button type="button" variant="destructive" :loading="busy" @click="restore('replace')">
          {{ copy.replace }}
        </Button>
        <Button type="button" :loading="busy" @click="restore('merge')">
          {{ copy.merge }}
        </Button>
      </div>

      <Button type="button" variant="ghost" @click="pending = null">
        {{ copy.cancel }}
      </Button>
    </div>

    <Button type="button" variant="ghost" class="mt-1 text-destructive" @click="askToWipe">
      <Trash2Icon class="mr-2 size-4" />
      {{ copy.erase }}
    </Button>
  </div>
</template>
