/**
 * Angular module for 'core' component. This component is divided to following logical components:
 *
 *  mksense.core.dependencies
 *  mksense.core.services
 */
(function() {
  'use strict';

  // Define mksense.core module
  angular.module('mksense.core', [
    'mksense.core.dependencies', // Note that this must be loaded first
    'mksense.core.components',
    'mksense.core.interceptors',
    'mksense.core.auth',
    'mksense.core.mksocket',
    'mksense.core.services'
  ]);

}());
