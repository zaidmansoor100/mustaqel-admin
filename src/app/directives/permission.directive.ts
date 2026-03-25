// src/app/directives/permission.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { PermissionService } from '../services/permission.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[appPermission]'
})
export class PermissionDirective implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private permissions: string[] = [];
    private mode: 'any' | 'all' = 'any';
    private hasView = false;
    private elseTemplate: TemplateRef<any> | null = null;

    @Input() set appPermission(value: string | string[]) {
        this.permissions = Array.isArray(value) ? value : [value];
        this.updateView();
    }

    @Input() set appPermissionMode(value: 'any' | 'all') {
        this.mode = value;
        this.updateView();
    }

    @Input() set appPermissionElse(template: TemplateRef<any>) {
        this.elseTemplate = template;
        this.updateView();
    }

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private permissionService: PermissionService
    ) {}

    ngOnInit() {
        this.checkPermission();
    }

    private checkPermission(): void {
        let check$;

        if (this.mode === 'all') {
            check$ = this.permissionService.hasAllPermissions(this.permissions);
        } else {
            check$ = this.permissionService.hasAnyPermission(this.permissions);
        }

        check$.pipe(takeUntil(this.destroy$)).subscribe((hasPermission) => {
            this.hasView = hasPermission;
            this.updateView();
        });
    }

    private updateView(): void {
        this.viewContainer.clear();

        if (this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else if (this.elseTemplate) {
            this.viewContainer.createEmbeddedView(this.elseTemplate);
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
